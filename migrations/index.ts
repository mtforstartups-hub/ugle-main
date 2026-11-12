import * as migration_20261106_104132 from './20261106_104132';
import * as migration_20261111_093233_add_blob_storage_fields from './20261111_093233_add_blob_storage_fields';

export const migrations = [
  {
    up: migration_20261106_104132.up,
    down: migration_20261106_104132.down,
    name: '20261106_104132',
  },
  {
    up: migration_20261111_093233_add_blob_storage_fields.up,
    down: migration_20261111_093233_add_blob_storage_fields.down,
    name: '20261111_093233_add_blob_storage_fields'
  },
];
