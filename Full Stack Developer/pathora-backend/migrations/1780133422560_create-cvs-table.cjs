"use strict";
exports.shorthands = undefined;
exports.up = async function up(pgm) {
  pgm.createExtension("pgcrypto", { ifNotExists: true });
  pgm.createTable("cvs", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    source_type: {
      type: "text",
      notNull: true,
    },
    raw_text: {
      type: "text",
      notNull: false,
    },
    file_name: {
      type: "text",
      notNull: false,
    },
    file_mime: {
      type: "text",
      notNull: false,
    },
    file_data: {
      type: "bytea",
      notNull: false,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
  });
  pgm.addConstraint(
    "cvs",
    "cvs_source_type_check",
    `CHECK (source_type IN ('text', 'file'))`,
  );
  pgm.addConstraint(
    "cvs",
    "cvs_source_consistency_check",
    `CHECK (
      (source_type = 'text' AND raw_text IS NOT NULL) OR
      (source_type = 'file' AND file_data IS NOT NULL AND file_mime IS NOT NULL)
    )`,
  );
};
exports.down = async function down(pgm) {
  pgm.dropTable("cvs");
};
