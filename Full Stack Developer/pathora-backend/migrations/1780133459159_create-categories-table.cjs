"use strict";
exports.shorthands = undefined;
exports.up = async function up(pgm) {
  pgm.createExtension("pgcrypto", { ifNotExists: true });
  pgm.createTable("categories", {
    code: {
      type: "text",
      primaryKey: true,
      notNull: true,
    },
    display_name: {
      type: "text",
      notNull: true,
    },
    description: {
      type: "text",
      notNull: false,
    },
  });
  pgm.sql(`
    INSERT INTO categories (code, display_name, description) VALUES
      ('INFORMATION-TECHNOLOGY', 'Information Technology', 'Bidang IT & Software Development'),
      ('DATA-SCIENCE',           'Data Science',           'Analisis data, ML, dan statistik'),
      ('ENGINEERING',            'Engineering',            'Rekayasa teknik'),
      ('DIGITAL-MEDIA',          'Digital Media',          'Media digital, desain, dan konten'),
      ('BUSINESS-DEVELOPMENT',   'Business Development',   'Pengembangan bisnis dan penjualan'),
      ('FINANCE',                'Finance',                'Keuangan dan akuntansi')
  `);
};
exports.down = async function down(pgm) {
  pgm.dropTable("categories");
};
