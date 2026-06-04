"use strict";
exports.shorthands = undefined;
exports.up = async function up(pgm) {
  pgm.createIndex("cvs", "user_id", { name: "idx_cvs_user_id" });
  pgm.createIndex("analyses", "user_id", { name: "idx_analyses_user_id" });
  pgm.createIndex("analyses", "cv_id", { name: "idx_analyses_cv_id" });
  pgm.createIndex("analyses", "status", { name: "idx_analyses_status" });
  pgm.createIndex("analyses", "predicted_category", {
    name: "idx_analyses_predicted_category",
  });
  pgm.createIndex("analyses", [{ name: "analyzed_at", sort: "DESC" }], {
    name: "idx_analyses_analyzed_at",
  });
  pgm.createIndex("analyses", "result", {
    name: "idx_analyses_result_gin",
    method: "gin",
  });
};
exports.down = async function down(pgm) {
  pgm.dropIndex("analyses", "result", { name: "idx_analyses_result_gin" });
  pgm.dropIndex("analyses", [{ name: "analyzed_at", sort: "DESC" }], {
    name: "idx_analyses_analyzed_at",
  });
  pgm.dropIndex("analyses", "predicted_category", {
    name: "idx_analyses_predicted_category",
  });
  pgm.dropIndex("analyses", "status", { name: "idx_analyses_status" });
  pgm.dropIndex("analyses", "cv_id", { name: "idx_analyses_cv_id" });
  pgm.dropIndex("analyses", "user_id", { name: "idx_analyses_user_id" });
  pgm.dropIndex("cvs", "user_id", { name: "idx_cvs_user_id" });
};
