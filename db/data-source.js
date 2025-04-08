"use strict";
// export const dataSource = {
//   type: 'sqlite',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: '123456',
//   database: 'db.sqlite',
//   entities: ['./dist/**/*.entity.js'],
//   migrations: ['dist/db/migrations/*.js'],
//   migrationsTableName: 'roles',
// };
exports.__esModule = true;
exports.dataSourceOptions = void 0;
var typeorm_1 = require("typeorm");
exports.dataSourceOptions = {
    type: 'sqlite',
    database: 'db.sqlite',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/db/migrations/*.js']
};
var dataSource = new typeorm_1.DataSource(exports.dataSourceOptions);
exports["default"] = dataSource;
