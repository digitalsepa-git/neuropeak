// Postgres kataloğunu okuyup supabase-js'in beklediği `Database` tipini üretir.
//
// Supabase'in kendi `gen types` komutu Docker istiyor; bu betik yalnızca
// psql'e ihtiyaç duyar, böylece CI'da ve yerelde aynı şekilde çalışır.
//
// Çalıştırmak için: scripts/generate-db-types.sh

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const databaseUrl = process.env.DATABASE_URL;
const outputPath = process.argv[2];

if (!databaseUrl || !outputPath) {
  console.error('DATABASE_URL ve çıktı yolu gerekli.');
  process.exit(64);
}

function query(sql) {
  const raw = execFileSync('psql', [databaseUrl, '-At', '-c', sql], { encoding: 'utf8' }).trim();
  return raw.length === 0 ? [] : JSON.parse(raw);
}

const enums = query(`
  select coalesce(json_agg(row_to_json(e) order by e.name), '[]'::json)
  from (
    select t.typname as name,
           array_agg(l.enumlabel order by l.enumsortorder) as labels
    from pg_type t
    join pg_enum l on l.enumtypid = t.oid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
    group by t.typname
  ) e;
`);

const columns = query(`
  select coalesce(json_agg(row_to_json(c) order by c.table_name, c.ordinal_position), '[]'::json)
  from (
    select
      cls.relname as table_name,
      cls.relkind as rel_kind,
      att.attname as column_name,
      att.attnum as ordinal_position,
      not att.attnotnull as is_nullable,
      format_type(att.atttypid, null) as formatted_type,
      typ.typname as udt_name,
      elem.typname as element_udt_name,
      pg_get_expr(def.adbin, def.adrelid) is not null as has_default,
      att.attidentity <> '' as is_identity,
      att.attgenerated <> '' as is_generated
    from pg_attribute att
    join pg_class cls on cls.oid = att.attrelid
    join pg_namespace ns on ns.oid = cls.relnamespace
    join pg_type typ on typ.oid = att.atttypid
    left join pg_type elem on elem.oid = typ.typelem
    left join pg_attrdef def on def.adrelid = att.attrelid and def.adnum = att.attnum
    where ns.nspname = 'public'
      and cls.relkind in ('r', 'v')
      and att.attnum > 0
      and not att.attisdropped
  ) c;
`);

const enumNames = new Set(enums.map((item) => item.name));

const SCALAR_TYPES = new Map([
  ['bool', 'boolean'],
  ['int2', 'number'],
  ['int4', 'number'],
  ['int8', 'number'],
  ['float4', 'number'],
  ['float8', 'number'],
  ['numeric', 'number'],
  ['json', 'Json'],
  ['jsonb', 'Json'],
]);

function pascal(name) {
  return name
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function tsType(column) {
  const isArray = column.udt_name.startsWith('_');
  const base = isArray ? column.element_udt_name : column.udt_name;

  let resolved;
  if (enumNames.has(base)) {
    resolved = `Database['public']['Enums']['${base}']`;
  } else {
    resolved = SCALAR_TYPES.get(base) ?? 'string';
  }

  return isArray ? `${resolved}[]` : resolved;
}

const tables = new Map();
for (const column of columns) {
  if (!tables.has(column.table_name)) {
    tables.set(column.table_name, { relKind: column.rel_kind, columns: [] });
  }
  tables.get(column.table_name).columns.push(column);
}

const sortedTables = [...tables.entries()].sort(([a], [b]) => a.localeCompare(b));

function renderRow(columnsOf, variant) {
  return columnsOf
    .filter((column) => !(variant === 'Insert' && column.is_generated))
    .map((column) => {
      const type = tsType(column);
      const nullable = column.is_nullable ? ' | null' : '';

      let optional = false;
      if (variant === 'Update') {
        optional = true;
      } else if (variant === 'Insert') {
        optional = column.is_nullable || column.has_default || column.is_identity;
      }

      return `        ${column.column_name}${optional ? '?' : ''}: ${type}${nullable};`;
    })
    .join('\n');
}

const tableBlocks = [];
const viewBlocks = [];

for (const [tableName, meta] of sortedTables) {
  if (meta.relKind === 'v') {
    viewBlocks.push(
      [
        `    ${tableName}: {`,
        `      Row: {`,
        renderRow(meta.columns, 'Row'),
        `      };`,
        `      Relationships: [];`,
        `    };`,
      ].join('\n'),
    );
    continue;
  }

  tableBlocks.push(
    [
      `    ${tableName}: {`,
      `      Row: {`,
      renderRow(meta.columns, 'Row'),
      `      };`,
      `      Insert: {`,
      renderRow(meta.columns, 'Insert'),
      `      };`,
      `      Update: {`,
      renderRow(meta.columns, 'Update'),
      `      };`,
      // supabase-js ilişki çıkarımı için bu anahtarı bekler; gömülü
      // sorgular kullanılmadığı için boş bırakılıyor.
      `      Relationships: [];`,
      `    };`,
    ].join('\n'),
  );
}

const enumBlock = enums
  .sort((a, b) => a.name.localeCompare(b.name))
  .map((item) => {
    const labels = item.labels.map((label) => `'${label}'`).join(' | ');
    return `    ${item.name}: ${labels};`;
  })
  .join('\n');

const output = `// ÜRETİLEN DOSYA — elle düzenlemeyin.
// Kaynak: supabase/migrations · Yeniden üretmek için: scripts/generate-db-types.sh

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  // supabase-js bu anahtarla istemcinin konuşacağı PostgREST sürümünü seçer.
  __InternalSupabase: {
    PostgrestVersion: '12';
  };
  public: {
    Tables: {
${tableBlocks.join('\n')}
    };
    Views: {
${viewBlocks.length > 0 ? viewBlocks.join('\n') : '      [key: string]: never;'}
    };
    Functions: {
      [key: string]: never;
    };
    Enums: {
${enumBlock}
    };
    CompositeTypes: {
      [key: string]: never;
    };
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateDto<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
`;

writeFileSync(outputPath, output);
console.error(`${sortedTables.length} tablo, ${enums.length} numaralandırma yazıldı.`);
