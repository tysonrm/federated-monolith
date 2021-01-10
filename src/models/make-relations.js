"use strict";

import Model from "./model";

const relationType = {
  /**
   *
   * @param {import("../models").Model} model
   * @param {import("../datasources/datasource").default} ds
   * @param {import("./index").relations[relation]} rel
   */
  oneToMany: async (model, ds, rel) =>
    (await ds.list()).filter(v => Model.getId(model) === v[rel.foreignKey]),
  /**
   *
   * @param {import("../models").Model} model
   * @param {import("../datasources/datasource").default} ds
   * @param {import("./index").relations[relation]} config
   */
  manyToOne: async (model, ds, rel) => ds.find(model[rel.foreignKey]),
};

/**
 * Generate functions to retrieve related domain objects.
 * @param {import("./index").Model} model
 * @param {import("./index").relations} relations
 * @param {*} dataSource
 */
export default function makeRelations (model, relations, dataSource) {
  if (Object.getOwnPropertyNames(relations).length < 1) return;

  return Object.keys(relations)
    .map(function (relation) {
      return {
        async [relation] () {
          const rel = relations[relation];
          const ds = dataSource.getFactory().getDataSource(rel.modelName);

          if (!relationType[rel.type]) {
            console.warn("invalid relation type: ", rel.type);
            return;
          }

          const result = await relationType[rel.type](model, ds, rel);
          return result;
        },
      };
    })
    .reduce((c, p) => ({ ...p, ...c }));
}