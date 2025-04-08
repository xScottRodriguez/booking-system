"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.migrationV11676002424511 = void 0;
var migrationV11676002424511 = /** @class */ (function () {
    function migrationV11676002424511() {
        this.name = 'migrationV11676002424511';
    }
    migrationV11676002424511.prototype.up = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("CREATE TABLE \"services\" (\"id\" integer PRIMARY KEY  NOT NULL, \"name\" varchar(100) NOT NULL, \"description\" varchar(500) NOT NULL, \"price\" decimal(10,2) NOT NULL DEFAULT (0), CONSTRAINT \"UQ_019d74f7abcdcb5a0113010cb03\" UNIQUE (\"name\"))")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"status\" (\"id\" integer PRIMARY KEY  NOT NULL, \"name\" varchar(12) NOT NULL, CONSTRAINT \"UQ_95ff138b88fdd8a7c9ebdb97a32\" UNIQUE (\"name\"))")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"booking\" (\"id\" integer PRIMARY KEY  NOT NULL, \"date\" varchar(10) NOT NULL, \"hour\" varchar(8) NOT NULL, \"client_id\" integer, \"service_id\" integer, \"status_id\" integer)")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"roles\" (\"id\" integer PRIMARY KEY  NOT NULL, \"name\" varchar(100) NOT NULL, \"description\" varchar(200), CONSTRAINT \"UQ_648e3f5447f725579d7d4ffdfb7\" UNIQUE (\"name\"))")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"users\" (\"id\" integer PRIMARY KEY  NOT NULL, \"username\" varchar NOT NULL, \"email\" text NOT NULL, \"password\" text, \"is_active\" boolean NOT NULL DEFAULT (0), \"is_google_account\" boolean NOT NULL DEFAULT (0), \"activation_token\" varchar, \"reset_password_token\" varchar, \"role_id\" integer, CONSTRAINT \"UQ_97672ac88f789774dd47f7c8be3\" UNIQUE (\"email\"), CONSTRAINT \"UQ_89a1c9adfee558c580dd8a2b6aa\" UNIQUE (\"activation_token\"), CONSTRAINT \"UQ_ee6419219542371563e0592db51\" UNIQUE (\"reset_password_token\"))")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"temporary_booking\" (\"id\" integer PRIMARY KEY  NOT NULL, \"date\" varchar(10) NOT NULL, \"hour\" varchar(8) NOT NULL, \"client_id\" integer, \"service_id\" integer, \"status_id\" integer, CONSTRAINT \"FK_65f5f7fdebd59a3289ee2f77b73\" FOREIGN KEY (\"client_id\") REFERENCES \"users\" (\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT \"FK_227cfeeee338c1e04fab754e56b\" FOREIGN KEY (\"service_id\") REFERENCES \"services\" (\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT \"FK_f3b521fe4729cfad477690ca29d\" FOREIGN KEY (\"status_id\") REFERENCES \"status\" (\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION)")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO \"temporary_booking\"(\"id\", \"date\", \"hour\", \"client_id\", \"service_id\", \"status_id\") SELECT \"id\", \"date\", \"hour\", \"client_id\", \"service_id\", \"status_id\" FROM \"booking\"")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"booking\"")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"temporary_booking\" RENAME TO \"booking\"")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"temporary_users\" (\"id\" integer PRIMARY KEY  NOT NULL, \"username\" varchar NOT NULL, \"email\" text NOT NULL, \"password\" text, \"is_active\" boolean NOT NULL DEFAULT (0), \"is_google_account\" boolean NOT NULL DEFAULT (0), \"activation_token\" varchar, \"reset_password_token\" varchar, \"role_id\" integer, CONSTRAINT \"UQ_97672ac88f789774dd47f7c8be3\" UNIQUE (\"email\"), CONSTRAINT \"UQ_89a1c9adfee558c580dd8a2b6aa\" UNIQUE (\"activation_token\"), CONSTRAINT \"UQ_ee6419219542371563e0592db51\" UNIQUE (\"reset_password_token\"), CONSTRAINT \"FK_a2cecd1a3531c0b041e29ba46e1\" FOREIGN KEY (\"role_id\") REFERENCES \"roles\" (\"id\") ON DELETE NO ACTION ON UPDATE NO ACTION)")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO \"temporary_users\"(\"id\", \"username\", \"email\", \"password\", \"is_active\", \"is_google_account\", \"activation_token\", \"reset_password_token\", \"role_id\") SELECT \"id\", \"username\", \"email\", \"password\", \"is_active\", \"is_google_account\", \"activation_token\", \"reset_password_token\", \"role_id\" FROM \"users\"")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"users\"")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"temporary_users\" RENAME TO \"users\"")];
                    case 13:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    migrationV11676002424511.prototype.down = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.query("ALTER TABLE \"users\" RENAME TO \"temporary_users\"")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"users\" (\"id\" integer PRIMARY KEY  NOT NULL, \"username\" varchar NOT NULL, \"email\" text NOT NULL, \"password\" text, \"is_active\" boolean NOT NULL DEFAULT (0), \"is_google_account\" boolean NOT NULL DEFAULT (0), \"activation_token\" varchar, \"reset_password_token\" varchar, \"role_id\" integer, CONSTRAINT \"UQ_97672ac88f789774dd47f7c8be3\" UNIQUE (\"email\"), CONSTRAINT \"UQ_89a1c9adfee558c580dd8a2b6aa\" UNIQUE (\"activation_token\"), CONSTRAINT \"UQ_ee6419219542371563e0592db51\" UNIQUE (\"reset_password_token\"))")];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO \"users\"(\"id\", \"username\", \"email\", \"password\", \"is_active\", \"is_google_account\", \"activation_token\", \"reset_password_token\", \"role_id\") SELECT \"id\", \"username\", \"email\", \"password\", \"is_active\", \"is_google_account\", \"activation_token\", \"reset_password_token\", \"role_id\" FROM \"temporary_users\"")];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"temporary_users\"")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("ALTER TABLE \"booking\" RENAME TO \"temporary_booking\"")];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("CREATE TABLE \"booking\" (\"id\" integer PRIMARY KEY  NOT NULL, \"date\" varchar(10) NOT NULL, \"hour\" varchar(8) NOT NULL, \"client_id\" integer, \"service_id\" integer, \"status_id\" integer)")];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("INSERT INTO \"booking\"(\"id\", \"date\", \"hour\", \"client_id\", \"service_id\", \"status_id\") SELECT \"id\", \"date\", \"hour\", \"client_id\", \"service_id\", \"status_id\" FROM \"temporary_booking\"")];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"temporary_booking\"")];
                    case 8:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"users\"")];
                    case 9:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"roles\"")];
                    case 10:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"booking\"")];
                    case 11:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"status\"")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, queryRunner.query("DROP TABLE \"services\"")];
                    case 13:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return migrationV11676002424511;
}());
exports.migrationV11676002424511 = migrationV11676002424511;
