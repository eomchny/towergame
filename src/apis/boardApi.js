const boardApi = {
  checkGold: (board, row, col, cb) => {
    const copy = [...board];
    const left = checkGoldCol(copy[row], col - 1, -1);
    const right = checkGoldCol(copy[row], col + 1, 1);
    const top = checkGoldRow(copy, row - 1, col, -1);
    const bottom = checkGoldRow(copy, row + 1, col, +1);

    const horizontal = [...left, ...right, copy[row][col]];
    const vertical = [...top, ...bottom, copy[row][col]];

    if (horizontal.length >= 3 && vertical.length < 3) {
      const len = horizontal.length;
      cb(len, len * 10);
      horizontal.map((item) => {
        copy[item.row][item.col] = null;
      });

      return copy;
    }

    if (vertical.length >= 3 && horizontal.length < 3) {
      const len = vertical.length;
      cb(len, len * 10);
      vertical.map((item) => {
        copy[item.row][item.col] = null;
      });

      return copy;
    }

    if (vertical.length >= 3 && horizontal.length >= 3) {
      const len = vertical.length + horizontal.length - 1;
      cb(len, len * 15);
      vertical.pop();

      const cross = [...horizontal, ...vertical];
      cross.map((item) => {
        copy[item.row][item.col] = null;
      });

      return copy;
    }

    return copy;
  },

  checkAttack: (board, row, col, cb) => {
    const copy = [...board];
    let cross = false;
    const left = checkAttackCol(copy[row], col - 1, -1);
    const right = checkAttackCol(copy[row], col + 1, 1);
    const top = checkAttackrow(copy, row - 1, col, -1);
    const bottom = checkAttackrow(copy, row + 1, col, +1);

    if (
      left.length >= 1 &&
      right.length >= 1 &&
      top.length >= 1 &&
      bottom.length >= 1
    ) {
      cross = true;
      const cols = [...left, ...right, ...top, ...bottom, copy[row][col]];
      cb(2, cols.length * 15);

      cols.map((item) => {
        copy[item.row][item.col] = null;
      });
      return copy;
    }

    const horizontal = [...left, ...right, copy[row][col]];
    if (horizontal.length >= 3) {
      cb(1, horizontal.length * 10);
      horizontal.map((item) => {
        copy[item.row][item.col] = null;
      });
      return copy;
    }

    const vertical = [...top, ...bottom, copy[row][col]];
    if (vertical.length >= 3) {
      cb(1, vertical.length * 10);
      vertical.map((item) => {
        copy[item.row][item.col] = null;
      });
      return copy;
    }

    return copy;
  },

  checkDefend: (board, row, col, cb) => {
    const copy = [...board];
    const base = copy[row][col];

    return board;
  },

  checkRecover: (board, row, col, cb) => {
    const copy = [...board];
    let cross = false;
    const lt = checkRecoverLTRB(copy, row - 1, col - 1, -1);
    const rb = checkRecoverLTRB(copy, row + 1, col + 1, +1);
    const lb = checkRecoverLBRT(copy, row + 1, col - 1, +1);
    const rt = checkRecoverLBRT(copy, row - 1, col + 1, -1);

    if (lt.length >= 1 && rb.length >= 1 && lb.length >= 1 && rt.length >= 1) {
      cross = true;
      const cols = [...lt, ...rb, ...lb, ...rt, copy[row][col]];
      cb(2, cols.length * 15);

      cols.map((item) => {
        copy[item.row][item.col] = null;
      });
      return copy;
    }

    const ltrb = [...lt, ...rb, copy[row][col]];
    if (ltrb.length >= 3) {
      cb(1, ltrb.length * 10);
      ltrb.map((item) => {
        copy[item.row][item.col] = null;
      });
      return copy;
    }

    const lbrt = [...lb, ...rt, copy[row][col]];
    if (lbrt.length >= 3) {
      cb(1, lbrt.length * 10);
      lbrt.map((item) => {
        copy[item.row][item.col] = null;
      });
      return copy;
    }

    return copy;
  },
};

/*골드 조건 체크*/
function checkGoldCol(row, start, step) {
  const result = [];
  let index = start;

  while (row[index] && row[index].name === "gold") {
    result.push(row[index]);
    index = index + step;
  }

  return result;
}

function checkGoldRow(board, start_row, col, step) {
  const result = [];
  let row = start_row;

  while (board[row] && board[row][col] && board[row][col].name === "gold") {
    result.push(board[row][col]);
    row = row + step;
  }

  return result;
}

/*공격 조건 체크*/
function checkAttackCol(row, start, step) {
  const result = [];
  let index = start;

  while (row[index] && row[index].name === "attack") {
    result.push(row[index]);
    index = index + step;
  }

  return result;
}

function checkAttackrow(board, start_row, col, step) {
  const result = [];
  let row = start_row;

  while (board[row] && board[row][col] && board[row][col].name === "attack") {
    result.push(board[row][col]);
    row = row + step;
  }

  return result;
}

/*회복 조건 체크*/
function checkRecoverLTRB(board, start_row, start_col, step) {
  //Letf Top To Right Bottom
  const result = [];
  let row = start_row;
  let col = start_col;

  while (board[row] && board[row][col] && board[row][col].name === "recover") {
    result.push(board[row][col]);

    row = row + step;
    col = col + step;
  }

  return result;
}

function checkRecoverLBRT(board, start_row, start_col, step) {
  //Left Bottom tom Right Top
  const result = [];
  let row = start_row;
  let col = start_col;

  while (board[row] && board[row][col] && board[row][col].name === "recover") {
    result.push(board[row][col]);

    row = row + step;
    col = col - step;
  }

  return result;
}

export default boardApi;
