$(document).ready(function() {
    class Piece {
        constructor(color, icon, pieceType) {
            this.color = color;
            this.icon = icon;
            this.pieceType = pieceType;
            this.x;
            this.y;
            this.item = document.createElement('i');
            this.item.style.color = color;
            this.item.classList.toggle(icon.split(' ')[0]);
            this.item.classList.toggle(icon.split(' ')[1]);
            this.hasMoved = false;
        }

        IsInRange(x, y) {
            x = parseInt(x);
            y = parseInt(y);
            if (x < 0 || x >= 8 || y >= 8 || y < 0) {
                return false;
            }
            return true;
        }

        GetLegalMoves(x, y, pos, dir) {
            var moveDirections = {
                r: [[0, 1], [0, -1], [-1, 0], [1, 0]],
                b: [[1, 1], [-1, 1], [1, -1], [-1, -1]],
                n: [[1, 2], [-1, 2], [1, -2], [-1, -2], [2, 1], [2, -1], [-2, 1], [-2, -1]],
                k: [[1, 1], [-1, 1], [1, -1], [-1, -1], [0, 1], [0, -1], [-1, 0], [1, 0]],
                q: [[1, 1], [-1, 1], [1, -1], [-1, -1], [0, 1], [0, -1], [-1, 0], [1, 0]],
                p: [heldPiece.firstChild.style.color == 'rgb(0, 0, 0)' ? [1, 0] : [-1, 0], !this.hasMoved && heldPiece.firstChild.style.color == 'rgb(0, 0, 0)' ? [2, 0] : [0, 0], !this.hasMoved && heldPiece.firstChild.style.color == 'rgb(255, 255, 255)' ? [-2, 0] : [0, 0]],
            }
            moveDirections = moveDirections[this.pieceType];
            if (dir == -1) {
                for (let i = 0; i < moveDirections.length; i++) {
                    var move = moveDirections[i];
                    var newX = this.x + move[0];
                    var newY = this.y + move[1];
                        if (this.IsInRange(newX, newY)) {
                            var color = null;
                            if (board[newX][newY].firstChild) {
                                color = board[newX][newY].firstChild.firstChild.style.color;
                            }
                            if (color != heldPiece.firstChild.style.color ) {
                                pos.push([newX, newY])
                                if (color) {
                                    board[newX][newY].classList.toggle('enemy-move');
                                } else if (['r', 'b', 'q'].includes(this.pieceType)){
                                    pos = this.GetLegalMoves(newX, newY, pos, i);
                                }
                            }
                        }
                }
            } else {
                var move = moveDirections[dir];
                var newX = x + move[0];
                var newY = y + move[1];

                if (this.IsInRange(newX, newY)) {
                    var color = null;
                    if (board[newX][newY].firstChild) {
                        color = board[newX][newY].firstChild.firstChild.style.color;
                    }

                    if (color != heldPiece.firstChild.style.color) {
                        pos.push([newX, newY])
                        if (color) {
                            board[newX][newY].classList.toggle('enemy-move');
                        } else {
                            pos = this.GetLegalMoves(newX, newY, pos, dir);
                        }
                    }
                }
            }
            return pos;
        }

        SetCurrentPos(x, y) {
            this.x = x;
            this.y = y;
        }
    }

    function GenerateBoard() {
        const rows = 8;
        const cols = 8;
        const boardContainer = document.getElementsByClassName('board')[0];
        var x = 0
        j = 0;
        i = 0;
        var timer = setInterval(() => {
            if (j == 0) {
                board.push([])
            }
            const item = document.createElement('div');
            item.classList.toggle('board-section');
            item.classList.toggle('board-odd', x % 2 == 0);
            item.setAttribute('id', i + ' ' + j)
            $(item).data('piece', null);
            boardContainer.appendChild(item);
            board[i].push(item);
            j++;
            x++;
            if (j == cols) {
                i++;
                j = 0;
                x++
            }
            if (i == rows) {
                clearInterval(timer)
                DeconstructFEN('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
            }
        }, 25);

    }

    function DeconstructFEN(fen) {
        pieceTypes = {
            r: "fas fa-chess-rook",
            b: "fas fa-chess-bishop",
            n: "fas fa-chess-knight",
            k: "fas fa-chess-king",
            q: "fas fa-chess-queen",
            p: "fas fa-chess-pawn",
        }
        var row = 0;
        var col = 0;
        var index = 0;
        var timer = setInterval(() => {
            letter = fen[index];
            var color = '#000000';
            if (letter == letter.toUpperCase()) {
                color = '#FFFFFF';
            }
            if (letter == '/') {
                row++;
                col = 0;
            }
            else if(Number(letter)) {
                col++;
            }
            else {
                const piece = document.createElement('div');
                piece.classList.toggle('chess-piece');
                $(piece).data('piece', new Piece(color, pieceTypes[letter.toLowerCase()], letter.toLowerCase()));
                $(piece).data('piece').SetCurrentPos(row, col);
                piece.appendChild($(piece).data('piece').item)
                board[row][col].appendChild(piece);
                col++;
            }
            index++
            if (index == fen.length) {
                pieces = document.getElementsByClassName('chess-piece');
                for (piece of pieces) {
                    piece = piece.firstChild;
                    piece.addEventListener('click', (e) => {
                        heldPiece = e.target.parentElement;
                        UpdateHeldPiecePos(e);
                        heldPiece.style.position = 'absolute';
                        heldPiece.style.opacity = '.5';
                        heldPiece.classList.toggle('held');
                        document.querySelector('body').style.cursor = 'pointer';
                        for (piece of pieces) {
                            piece.style.pointerEvents = 'none';
                        }
                        possibleMoves = $(heldPiece).data('piece').GetLegalMoves($(heldPiece).data('piece').x, $(heldPiece).data('piece').y, [], -1)
                        for (move of possibleMoves) {
                            board[move[0]][move[1]].classList.toggle('possible-move')
                        }
                    })
                }
                clearInterval(timer)
            }
        }, 50);
    }

    function UpdateHeldPiecePos(e) {
        boardContainer = document.getElementsByClassName('board')[0];
        body = boardContainer.getBoundingClientRect();
        mousePosX = e.clientX + mouseOffsetX;
        mousePosY = e.clientY + mouseOffsetY;
        insideLeft = mousePosX >= body.left;
        insideRight = mousePosX <= body.right + (-60);
        insideUp = mousePosY >= body.top;
        insideBottom = mousePosY <= body.bottom + (-75);
        if (insideLeft && insideRight) {
            heldPiece.style.left = mousePosX + 'px';
        } else {
            if (!insideLeft) {
                heldPiece.style.left = body.left + 'px';
            } else if (!insideRight) {
                heldPiece.style.left = (body.right + -60) + 'px';
            }
        }
        if (insideBottom && insideUp) {
            heldPiece.style.top = mousePosY + 'px';
        } else {
            if (!insideBottom) {
                heldPiece.style.top = (body.bottom + -75) + 'px';
            } else if (!insideUp) {
                heldPiece.style.top = body.top + 'px';
            }
        }
    }

    const board = []
    var possibleMoves = [];
    var mousePosX;
    var mousePosY;
    const mouseOffsetX = -18;
    const mouseOffsetY = -26;
    var heldPiece;
    var pieces;
    GenerateBoard();
    window.addEventListener('mousemove', (e) => {
        if (heldPiece) {
            UpdateHeldPiecePos(e);
        }
    })

    window.addEventListener('mousedown', (e) => {
        if (heldPiece) {
            heldPiece.style.opacity = '1';
            heldPiece.style.left = '0';
            heldPiece.style.top = '0';
            heldPiece.style.position = 'initial'
            heldPiece.classList.toggle('held');
            document.querySelector('body').style.cursor = 'initial';
            for (piece of pieces) {
                piece.style.pointerEvents = 'initial';
            }
            for (move of possibleMoves) {
                board[move[0]][move[1]].classList.toggle('possible-move')
                board[move[0]][move[1]].classList.remove('enemy-move')
            }
            if ((e.target.className == 'board-section' || e.target.className == 'board-section board-odd')) {
                var newPos = [parseInt(e.target.id.split(' ')[0]), parseInt(e.target.id.split(' ')[1])];
                var canMove = false;
                for (move of possibleMoves) {
                    if (move[0] == newPos[0] && move[1] == newPos[1]) {
                        canMove = true;
                    }
                }
                if (canMove) {
                    if (e.target.firstChild) {
                        if (e.target.firstChild.firstChild.style.color != heldPiece.firstChild.style.color) {
                            e.target.firstChild.remove();
                            heldPiece.parentElement.removeChild(heldPiece);
                            e.target.appendChild(heldPiece);
                        }
                    } else {
                        heldPiece.parentElement.removeChild(heldPiece);
                        e.target.appendChild(heldPiece);
                    }
                    posX = parseInt(e.target.id.split(' ')[0]);
                    posY = parseInt(e.target.id.split(' ')[1]);
                    $(heldPiece).data('piece').SetCurrentPos(posX, posY);
                    $(heldPiece).data('piece').hasMoved = true;
                }
            }
            heldPiece = null;
        }
    })
})