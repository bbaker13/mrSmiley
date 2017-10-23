// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');

var _editor;
var player = {
    _currX:10,
    _currY:10,
    _oldX:10,
    _oldY:10,
};

var baddies = [
    {
        _currX:3,
        _currY:4,
        _minX:0,
        _maxX:6,
        _deltaX:1,
        _minY:4,
        _maxY:4,
        _deltaY:0
    },
    {
        _currX:15,
        _currY:15,
        _minX:10,
        _maxX:20,
        _deltaX:1,
        _minY:15,
        _maxY:15,
        _deltaY:0
    },
    {
        _currX:8,
        _currY:8,
        _minX:15,
        _maxX:15,
        _deltaX:0,
        _minY:7,
        _maxY:12,
        _deltaY:1
    },
    {
        _currX:55,
        _currY:19,
        _minX:53,
        _maxX:57,
        _deltaX:-1,
        _minY:16,
        _maxY:20,
        _deltaY:1
    },
    {
        _currX:46,
        _currY:10,
        _minX:31,
        _maxX:54,
        _deltaX:1,
        _minY:10,
        _maxY:10,
        _deltaY:0
    }
];

var walls = [
    {
        _topX:6,
        _topY:0,
        _bottomX:7,
        _bottomY:4
    },
    {
        _topX:14,
        _topY:4,
        _bottomX:45,
        _bottomY:5
    },
    {
        _topX:44,
        _topY:5,
        _bottomX:45,
        _bottomY:7
    },
    {
        _topX:55,
        _topY:7,
        _bottomX:56,
        _bottomY:10
    },
    {
        _topX:55,
        _topY:10,
        _bottomX:72,
        _bottomY:11
    },
    {
        _topX:30,
        _topY:7,
        _bottomX:31,
        _bottomY:11
    },
    {
        _topX:14,
        _topY:9,
        _bottomX:25,
        _bottomY:10
    },
    {
        _topX:25,
        _topY:14,
        _bottomX:38,
        _bottomY:15
    },
    {
        _topX:31,
        _topY:15,
        _bottomX:32,
        _bottomY:18
    },
    {
        _topX:10,
        _topY:18,
        _bottomX:25,
        _bottomY:19
    },
    {
        _topX:24,
        _topY:19,
        _bottomX:25,
        _bottomY:21
    },
    {
        _topX:0,
        _topY:7,
        _bottomX:8,
        _bottomY:8
    },
    {
        _topX:0,
        _topY:12,
        _bottomX:8,
        _bottomY:13
    },
    {
        _topX:55,
        _topY:4,
        _bottomX:72,
        _bottomY:5
    }
];

var coins = [
    {
        _currX:3,
        _currY:1
    },
    {
        _currX:2,
        _currY:10
    },
    {
        _currX:2,
        _currY:9
    },
    {
        _currX:59,
        _currY:2
    },
    {
        _currX:59,
        _currY:8
    },
    {
        _currX:57,
        _currY:19
    },
    {
        _currX:22,
        _currY:19
    },
    {
        _currX:20,
        _currY:7
    }
];

var goal;

var _maxX;
var _maxY;
var _minX;
var _minY;
var _midX;
var _midY;
var xOffset = 1;
var yOffset = 1;
var _cols;
var _rows;
var _screen = [];
var _gameStartTime;
var _score;
var _goal;
var _gameOver;

var borders = [
    '╔══════════════════════════════════════════════════════════════╗\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║ SCORE: 0000\n',
    '║                                                              ║\n',
    '║                                                              ║ Player - ☺\n',
    '║                                                              ║ Baddy  - Ö (-100 pts)\n',
    '║                                                              ║ Coin   - © (+200 pts)\n',
    '║                                                              ║ Wall   - █\n',
    '║                                                              ║ Goal   - ░\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '║                                                              ║\n',
    '╚══════════════════════════════════════════════════════════════╝\n'
];

function handleInput(ed, doc) {
    var _cLine = doc.lineCount - 1;
    var _command = doc.lineAt(_cLine).text;

    var i=_command.length - 1;
    if(!_goal && !_gameOver){
        if(_command[i] == 'w') {
            keyPress('up');
        } else if(_command[i] == 's') {
            keyPress('down');
        } else if(_command[i] == 'a') {
            keyPress('left');
        } else if(_command[i] == 'd') {
            keyPress('right');
        }
    } else {
        if(_command[i]){
            resetGame();
        }
    }

    //Clear the last line where commands are entered
    ed.replace(
        new vscode.Range(
            new vscode.Position(_cLine, 0),
            new vscode.Position(_cLine, 999999)),
        "");
}

function keyPress(key) {
    player._oldX = player._currX;
    player._oldY = player._currY;

    switch(key) {
        case 'up':
            if(player._currY > _minY)
                player._currY--;
            break;
        case 'down':
            if(player._currY < _maxY)
                player._currY++;
            break;
        case 'left':
            if(player._currX > _minX)
                player._currX--;
            break;
        case 'right':
            if(player._currX < _maxX)
                player._currX++;
            break;
    }
}

function clearScreen(ed, doc) {
    var _last = doc.lineCount - 1;
    ed.delete(
        new vscode.Range(
            new vscode.Position(0,0),
            new vscode.Position(_last, 999999)
        )
    );
}

function gameInit(ed)
{
    for(var y = 0;y < borders.length; y++)
    {
        ed.insert(new vscode.Position(y,0), borders[y]);
    }

    for(var y = 0; y < _rows; y++) {
        _screen[y]=[];
        for(var x = 0; x < _cols; x++) {
            _screen[y][x] = 0;
        }
    }

    //init score
    _gameStartTime = new Date();
    _score = 1000;

    createBox(goal, 5);
    for(var i = 0; i < coins.length; i++){
        createChar(coins[i], 3);
    }

    for(var i = 0; i < walls.length; i++) {
        createBox(walls[i], 2);
    }

}

//Game loop
function gameRender() {

    if(_score > 0 && !_goal){
        _editor.edit(function(ed) {
            var gameTime = new Date() - _gameStartTime;

            if(gameTime % 5 == 0){
                _score -= 1;
            }

            if(gameTime % 4 == 0){
                for(var i = 0; i < baddies.length; i++) {
                    baddyMove(baddies[i]);
                }
            }

            handleInput(ed, _editor.document);
            playerMove();
            screenRender(ed);

        }).then(function() {
            setTimeout(gameRender, 20);
        });
    } else {
        var val;
        if(_goal) {
            val = 7;
        } else {
            _gameOver = true;
            _score = 0;
            val = 6;
        }
        _screen[_midY][_midX - 5] = val;
        _editor.edit(function(ed) {
            handleInput(ed, _editor.document);
            screenRender(ed);
        }).then(function() {
            setTimeout(gameRender, 20);
        });
        
    }

}

function baddyMove(baddy) {
    _screen[baddy._currY][baddy._currX] = 0;
    if(baddy._currX != baddy._maxX && baddy._currX != baddy._minX){
        baddy._currX += baddy._deltaX;
    } else {
        baddy._deltaX *= -1;
        baddy._currX += baddy._deltaX;
    }

    if(baddy._currY != baddy._maxY && baddy._currY != baddy._minY){
        baddy._currY += baddy._deltaY;
    } else {
        baddy._deltaY *= -1;
        baddy._currY += baddy._deltaY;
    }

    _screen[baddy._currY][baddy._currX] = 4;
}

function createBox(wall, type) {
    for(var i = wall._topY; i < wall._bottomY; i++){
        for(var j = wall._topX; j < wall._bottomX; j++){
            _screen[i][j] = type;
        }
    }
}

function createChar(character, type) {
    _screen[character._currY][character._currX] = type;
}

function playerMove() {
    var collisionResult = checkCollision(player._currX, player._currY);

    if(collisionResult == 'safe') {
        _screen[player._oldY][player._oldX] = 0;
        _screen[player._currY][player._currX] = 1;
    } else if(collisionResult == 'blocked') {
        player._currX = player._oldX;
        player._currY = player._oldY;
    } else if (collisionResult == 'coin') {
        _score += 200;
        _screen[player._oldY][player._oldX] = 0;
        _screen[player._currY][player._currX] = 1;
    } else if (collisionResult == 'baddy') {
        _score -= 100;
        player._currX = player._oldX;
        player._currY = player._oldY;
    } else if (collisionResult == 'goal') {
        //win screen
        _goal = true;
    }
}

function checkCollision(targetX, targetY) {
    if(_screen[targetY][targetX] == 0){
        return 'safe';
    } else if(_screen[targetY][targetX] == 2) {
        return 'blocked';
    } else if(_screen[targetY][targetX] == 3) {
        return 'coin';
    } else if(_screen[targetY][targetX] == 4) {
        return 'baddy';
    } else if(_screen[targetY][targetX] == 5) {
        return 'goal';
    }
}

function screenRender(ed) {
    for(var y = 0; y < _rows; y++) {
        var str = '';
        var optBuffer = 0;
        for(var x = 0; x < _cols; x++) {
            //Blank space
            if(_screen[y][x] == 0) {
                str += ' ';
            //Player
            } else if(_screen[y][x] == 1) {
                str += '☺';
            //Wall
            } else if(_screen[y][x] == 2) {
                str += '█';
            //Coin
            } else if(_screen[y][x] == 3) {
                str += '©';
            //Baddy
            } else if(_screen[y][x] == 4) {
                str += 'Ö';
            //goal
            } else if(_screen[y][x] == 5) {
                str += '░';
            } else if(_screen[y][x] == 6) {
                var gameOver = 'GAME OVER';
                str += gameOver;
                x += gameOver.length - 1;
            } else if(_screen[y][x] == 7) {
                var youWin = 'SCORE: ' + _score;
                str += youWin;
                x += youWin.length - 1;
            }

            //print score
            if(y == 7 && x == _cols - 1){
                str += '║ SCORE: ' + _score;
                optBuffer = 13;
            }
        }

        ed.replace(
            new vscode.Range(
                new vscode.Position(y + yOffset, xOffset),
                new vscode.Position(y + yOffset, _cols + xOffset + optBuffer)),
            str
        );
    }
}

function resetGame() {
    player._currX = _cols/2;
    player._currY = _rows - 1;
    _gameOver = false;
    _goal = false;

    _editor.edit(function(ed) {
        clearScreen(ed, _editor.document);
    })
    .then(
        function() {
        _editor.edit(function(ed) {
            gameInit(ed);
        });
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "MrSmiley" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.mrSmiley', function () {
        // The code you place here will be executed every time your command is executed
        _editor = vscode.window.activeTextEditor;
        _maxX = borders[0].length - xOffset - 3;
        _minX = 1;
        _maxY = borders.length - yOffset - 2;
        _minY = 0;
        _cols = borders[0].length - xOffset - 2;
        _rows = borders.length - yOffset - 1;
        _midX = Math.round(_cols/2);
        _midY = Math.round(_rows/2);
        goal = {
            _topX: _cols/2 - 3,
            _topY: 0,
            _bottomX: _cols/2 + 3,
            _bottomY: 1
        };

        player._currX = _cols/2;
        player._currY = _rows - 1;

        _editor.edit(function(ed) {
            clearScreen(ed, _editor.document);
        })
        .then(
            function() {
            _editor.edit(function(ed) {
                gameInit(ed);
            }).then(gameRender);
        }
        );
    });

    context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;