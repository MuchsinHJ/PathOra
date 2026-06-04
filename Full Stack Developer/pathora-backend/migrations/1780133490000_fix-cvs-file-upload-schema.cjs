"use strict";

exports.shorthands = undefined;

exports.up = async function up(pgm) {
  pgm.sql(`
    ALTER TABLE cvs
      ADD COLUMN IF NOT EXISTS file_name TEXT,
      ADD COLUMN IF NOT EXISTS file_mime TEXT,
      ADD COLUMN IF NOT EXISTS file_data BYTEA;

    ALTER TABLE cvs
      ALTER COLUMN raw_text DROP NOT NULL;
  `);
};

exports.down = async function down(pgm) {
  pgm.sql(`
    ALTER TABLE cvs
      DROP COLUMN IF EXISTS file_data,
      DROP COLUMN IF EXISTS file_mime,
      DROP COLUMN IF EXISTS file_name;

    ALTER TABLE cvs
      ALTER COLUMN raw_text SET NOT NULL;
  `);
};
