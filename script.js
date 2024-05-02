const correspondingPieces = {
    p: "fa-chess-pawn",
    r: "fa-chess-rook",
    n: "fa-chess-knight",
    b: "fa-chess-bishop",
    q: "fa-chess-queen",
    k: "fa-chess-king",
};

class Board {
    constructor(row = 8, column = 8) {
        this.row = 8;
        this.column = 8;
        // Initialize the nested array with initial values
        this.array = [];
        for (let i = 0; i < row; i++) {
            let nrow = [];
            for (let j = 0; j < column; j++) {
                nrow.push(0);
            }
            this.array.push(nrow);
        }
    }

    replace_board(newboard) {
        if (newboard.length == this.row) {
            for (let i = 0; i < this.array.length; i++) {
                if (i > 1000) {
                    console.log("too many column")
                    return;
                }
                if (newboard[i].length != this.array.length) {
                    console.log("invalid column count");
                    return;
                }
            }
            this.array = newboard;
        }
    }

    outofbound(row, col) {
        if (row >= 0 && row < 8 && col >= 0 && col < 8) {
            return false;
        } else {
            console.log("ERROR, coordinates out of bounds");
            return true;
        }
    }

    log(row, col) {
        if (this.outofbound(row, col)) return false;
        console.log(this.array[row][col]);
    }

    get(row, col) {
        if (this.outofbound(row, col)) return false;
        return this.array[row][col];
    }

    change(row, col, newValue = 0) {
        if (this.outofbound(row, col)) return false;
        this.array[row][col] = newValue;
    }

    move(firstcor, seccor) {
        if (this.outofbound(...firstcor)) return false;
        if (this.outofbound(...seccor)) return false;
        this.change(...seccor, this.get(...firstcor));
        this.change(...firstcor);
    }

    delete(row, col) {
        if (this.outofbound(row, col)) return false;
        this.array[row][col] = 0;
    }

    console_display_board() {
        for (let i = 0; i < this.array.length; i++) {
            console.log(`${i + 1}. `, this.array[i].join(", "));
        }
    }

    get_board() {
        return this.array;
    }
}

// const board = new Board;
// board.change(0, 0, "joke");
// board.move([0, 0], [1, 2]);
// board.console_display_board();

class Chess extends Board {
    constructor(displaysquares = false, position = true) {
        super(8, 8);

        // additional display
        this.turndisplay = document.querySelector(".turn");

        this.activatedpawn = [];
        this.eaten = [];
        this.displaysquares = displaysquares;
        this.position = position;

        if (position) {
            this.array = [
                ["br", "bn", "bb", "bq", "bk", "bb", "bn", "br"],
                ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
                ["wr", "wn", "wb", "wq", "wk", "wb", "wn", "wr"]
            ];
        } else {
            this.array = [
                ["wr", "wn", "wb", "wk", "wq", "wb", "wn", "wr"],
                ["wp", "wp", "wp", "wp", "wp", "wp", "wp", "wp"],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                [0, 0, 0, 0, 0, 0, 0, 0],
                ["bp", "bp", "bp", "bp", "bp", "bp", "bp", "bp"],
                ["br", "bn", "bb", "bk", "bq", "bb", "bn", "br"],
            ];
        }
    }

    display() {
        if (this.displaysquares == false) {
            console.log("ERROR, reference the display object first");
            return;
        }
        this.turndisplay.textContent = (turn) ? "white to move" : "black to move";

        for (let squarec of this.displaysquares) {
            let srow = squarec.getAttribute("row");
            let scol = squarec.getAttribute("col");

            let piecevalue = this.array[srow][scol];
            // let piecevalue;
            // if (this.position) {
            //     piecevalue = this.array[srow][scol];
            // } else {
            //     let arraycopy = [...this.array];
            //     for (let eacharr of arraycopy) {
            //         eacharr.reverse();
            //     }
            //     arraycopy.reverse();
            //     piecevalue = arraycopy[srow][scol];
            // }

            squarec.value = piecevalue;
            squarec.value = (squarec.value != "0") ? squarec.value : "";

            squarec.innerHTML = "";
            if (piecevalue[0] == "w") {
                squarec.innerHTML = `<i class='whitepiece fa-solid ${correspondingPieces[piecevalue[1]]}'></i>`;
            } else {
                squarec.innerHTML = `<i class='fa-solid ${correspondingPieces[piecevalue[1]]}'></i>`;
            }
        }
    }

    chessmove(piece, firstcor, seccor) {
        // check if it's empty square
        if (this.array[firstcor[0]][firstcor[1]] == 0) {
            console.log("empty");
            return false;
        } else if (firstcor[0] == seccor[0] && firstcor[1] == seccor[1]) {
            console.log("same coordinate");
            return false;
        }
        let direction = piece[0];
        piece = piece[1];
        let turnconverter = (direction == "w") ? true : false;
        if (turnconverter != turn) {
            // console.log(`invalid turn`)
            let whoMove = (turnconverter) ? "black" : "white";
            console.log(`${whoMove} to move`);
            return false;
        }
        if (this.validpos(firstcor, seccor, piece, direction)) {
            if (this.maxtrajectory(firstcor, seccor, piece)) {
                if (!this.eat(seccor, direction)) {
                    console.log("can't eat your ally");
                    return false;
                }
                this.move(firstcor, seccor);
                turn = !turn;
                this.display();
                return true;
            } else {
                console.log("blocked");
                return false;
            }
        } else {
            console.log("invalid move");
            return false;
        }
    }

    maxtrajectory(initialpos, newpos, piece) {
        let operation = "";
        let differenceY = newpos[0] - initialpos[0];
        let differenceX = newpos[1] - initialpos[1];
        switch (piece) {
            case "p":
                return true;
            case "n":
                return true;
            case "b":
                if (differenceY > 0 && differenceX > 0) operation = "br";
                else if (differenceY < 0 && differenceX > 0) operation = "bl";
                else if (differenceY > 0 && differenceX < 0) operation = "ur";
                else operation = "ul";

                for (let bishop = 1; bishop < Math.abs(differenceY); bishop++) {
                    let addY = initialpos[0];
                    let addX = initialpos[1];
                    let mastercoor = [];
                    switch (operation) {
                        case "br":
                            mastercoor = [addY + bishop, addX + bishop];
                            break;
                        case "bl":
                            mastercoor = [addY - bishop, addX + bishop];
                            break;
                        case "ur":
                            mastercoor = [addY + bishop, addX - bishop];
                            break;
                        case "ul":
                            mastercoor = [addY - bishop, addX - bishop];
                            break;
                        default:
                            break;
                    }
                    if (this.get(...mastercoor) != 0) {
                        return false;
                    }
                }
                return true;
            case "q":
                if (initialpos[0] != newpos[0] && initialpos[1] != newpos[1]) {
                    if (differenceY > 0 && differenceX > 0) operation = "br";
                    else if (differenceY < 0 && differenceX > 0) operation = "bl";
                    else if (differenceY > 0 && differenceX < 0) operation = "ur";
                    else operation = "ul";

                    for (let queen2 = 1; queen2 < Math.abs(differenceY); queen2++) {
                        let addY = initialpos[0];
                        let addX = initialpos[1];
                        let mastercoor = [];
                        switch (operation) {
                            case "br":
                                mastercoor = [addY + queen2, addX + queen2];
                                break;
                            case "bl":
                                mastercoor = [addY - queen2, addX + queen2];
                                break;
                            case "ur":
                                mastercoor = [addY + queen2, addX - queen2];
                                break;
                            case "ul":
                                mastercoor = [addY - queen2, addX - queen2];
                                break;
                            default:
                                break;
                        }
                        if (this.get(...mastercoor) != 0) {
                            return false;
                        }
                    }
                    return true;
                } else {
                    let incqueen;
                    if (initialpos[0] == newpos[0]) {
                        let difference = newpos[1] - initialpos[1];
                        incqueen = (difference > 0) ? true : false;
                        for (let queen1 = 1; queen1 < Math.abs(difference); queen1++) {
                            let everysquare = (incqueen) ? initialpos[1] + queen1 : initialpos[1] - queen1
                            if (this.array[initialpos[0]][everysquare] != 0) return false;
                        }
                    } else {
                        let difference = newpos[0] - initialpos[0];
                        incqueen = (difference > 0) ? true : false;
                        for (let queen1 = 1; queen1 < Math.abs(difference); queen1++) {
                            let everysquare = (incqueen) ? initialpos[0] + queen1 : initialpos[0] - queen1
                            if (this.array[everysquare][initialpos[1]] != 0) return false;
                        }
                    }
                    return true;
                }
            case "k":
                return true;
            case "r":
                let incrook;
                if (initialpos[0] == newpos[0]) {
                    let difference = newpos[1] - initialpos[1];
                    incrook = (difference > 0) ? true : false;
                    for (let rook = 1; rook < Math.abs(difference); rook++) {
                        let everysquare = (incrook) ? initialpos[1] + rook : initialpos[1] - rook
                        if (this.array[initialpos[0]][everysquare] != 0) return false;
                    }
                } else {
                    let difference = newpos[0] - initialpos[0];
                    incrook = (difference > 0) ? true : false;
                    for (let rook = 1; rook < Math.abs(difference); rook++) {
                        let everysquare = (incrook) ? initialpos[0] + rook : initialpos[0] - rook
                        if (this.array[everysquare][initialpos[1]] != 0) return false;
                    }
                }
                return true;
            default:
                console.log("no corresponding pieces");
                return false;
        }
    }

    validpos(initialpos, newpos, piece, direction) {
        if (!this.position) {
            direction = (direction == "w") ? "b" : "w";
        }
        let distanceY = Math.abs(initialpos[0] - newpos[0]);
        let distanceX = Math.abs(initialpos[1] - newpos[1]);
        switch (piece) {
            case "p":
                let distanceP = initialpos[0] - newpos[0];
                // pawn record, this will then be used for en passant
                let maxtravelpawn = (this.activatedpawn.includes(`${direction}${piece}${initialpos[1]}`)) ? 1 : 2;
                if (distanceY > maxtravelpawn || distanceX > 1) {
                    return false;
                } else if (distanceX != 0 && distanceY == 1) {
                    if (direction == "w") {
                        if (this.array[newpos[0]][newpos[1]] != 0) return true;
                        else return false;
                    } else {
                        if (this.array[newpos[0]][newpos[1]] != 0) return true;
                        else return false;
                    }
                } else if (distanceX == 0) {
                    if (this.array[newpos[0]][newpos[1]]) return false;
                    if (direction == "w") {
                        if (distanceP < 0) return false;
                    } else {
                        if (distanceP > 0) return false;
                    }
                    // console.log(`${direction}${piece}${initialpos[1]}`);
                    this.activatedpawn.push(`${direction}${piece}${initialpos[1]}`);
                    return true;
                } else {
                    return false;
                }
            case "n":
                if (distanceY == 2 && distanceX == 1) {
                    return true;
                } else if (distanceY == 1 && distanceX == 2) {
                    return true;
                } else {
                    return false;
                }
            case "b":
                if (distanceY == distanceX) {
                    return true;
                } else {
                    return false;
                }
            case "q":
                if (distanceY == distanceX) {
                    return true;
                } else {
                    if (initialpos[0] != newpos[0] && initialpos[1] != newpos[1]) {
                        return false;
                    } else {
                        return true;
                    }
                }

            case "k":
                if (distanceY > 1 || distanceX > 1) {
                    return false;
                } else {
                    return true;
                }

            case "r":
                if (initialpos[0] != newpos[0] && initialpos[1] != newpos[1]) {
                    return false;
                } else {
                    return true;
                }
            default:
                console.log("no corresponding pieces");
                return false;
        }
    }

    eat(newpos, direction) {
        // let turnconverter = (direction == "w") ? true : false;
        let enemy = this.get(...newpos);
        if (enemy[0] != direction) return true;
        else return false;
    }
}

let turn = true;
let firstcoor = [];
let secondcoor = [];
let prevsquare = false;
let nextsquare = false;
let moveflag = false;

const squares = document.querySelectorAll(".square");
const chess = new Chess(squares, true);

chess.display();

squares.forEach(element => {
    element.addEventListener("click", () => {
        if (element.value == "" && !moveflag) {
            return;
        }

        let wb = (turn) ? "w" : "b";
        if (element.value[0] != wb && !moveflag) {
            return;
        }
        x = parseInt(element.getAttribute("row"));
        y = parseInt(element.getAttribute("col"));
        if (!moveflag) {
            element.classList.add("on");
            if (nextsquare != false) {
                nextsquare.classList.remove("on");
            }
            // get first coordinate
            firstcoor = [x, y];
            moveflag = true;
            prevsquare = element;
        } else {
            secondcoor = [x, y];
            // disable all active square
            // run code
            let result = chess.chessmove(prevsquare.value, firstcoor, secondcoor);
            if (result) {
                nextsquare = element;
                element.classList.add("on");
                prevsquare.classList.remove("on");
                moveflag = false;
            } else {
                if (element.value != "") {
                    element.classList.add("on");
                    prevsquare.classList.remove("on");
                    firstcoor = [x, y];
                    moveflag = true;
                    prevsquare = element;
                }
            }
        }
        // console.log(element.getAttribute("row"), element.getAttribute("col"));
    })
});
// chess.console_display_board();





function algebraic_conversion() {

}