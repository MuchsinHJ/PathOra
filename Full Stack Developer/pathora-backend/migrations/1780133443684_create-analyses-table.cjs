"use strict";
exports.shorthands = undefined;
exports.up = async function up(pgm) {
  pgm.createExtension("pgcrypto", { ifNotExists: true });
  pgm.createTable("analyses", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
    },
    cv_id: {
      type: "uuid",
      notNull: true,
      references: '"cvs"',
      onDelete: "CASCADE",
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: '"users"',
      onDelete: "CASCADE",
    },
    status: {
      type: "text",
      notNull: true,
      default: "pending",
    },
    predicted_category: {
      type: "text",
      notNull: false,
    },
    confidence: {
      type: "numeric(5,4)",
      notNull: false,
    },
    result: {
      type: "jsonb",
      notNull: false,
    },
    analyzed_at: {
      type: "timestamptz",
      notNull: false,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
  });
  pgm.addConstraint(
    "analyses",
    "analyses_status_check",
    `CHECK (status IN ('pending', 'success', 'failed'))`,
  );
};
exports.down = async function down(pgm) {
  pgm.dropTable("analyses");
};
