"use strict";
exports.shorthands = undefined;
exports.up = async function up(pgm) {
  pgm.createExtension("pgcrypto", { ifNotExists: true });
  pgm.createTable("users", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
      notNull: true,
    },
    email: {
      type: "text",
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: "text",
      notNull: true,
    },
    full_name: {
      type: "text",
      notNull: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("NOW()"),
    },
  });
};
exports.down = async function down(pgm) {
  pgm.dropTable("users");
};
