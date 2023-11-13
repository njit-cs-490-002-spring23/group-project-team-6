"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.GAME_HASNT_STARTED_MESSAGE = exports.GAME_FULL_MESSAGE = exports.INVALID_MOVE_MESSAGE = exports.PLAYER_ALREADY_IN_GAME_MESSAGE = exports.PLAYER_NOT_IN_GAME_MESSAGE = void 0;
exports.PLAYER_NOT_IN_GAME_MESSAGE = 'Player is not in this game';
exports.PLAYER_ALREADY_IN_GAME_MESSAGE = 'Player is already in this game';
exports.INVALID_MOVE_MESSAGE = 'Invalid Card! Use the right color or value as seen.';
exports.GAME_FULL_MESSAGE = 'Game is full';
exports.GAME_HASNT_STARTED_MESSAGE = 'Game has not yet started.';
var InvalidParametersError = /** @class */ (function (_super) {
    __extends(InvalidParametersError, _super);
    function InvalidParametersError(message) {
        var _this = _super.call(this, message) || this;
        _this.message = message;
        return _this;
    }
    return InvalidParametersError;
}(Error));
exports.default = InvalidParametersError;
