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
      cb(horizontal.length);
      horizontal.map((item) => {
        copy[item.row][item.col] = null;
      });

      return copy;
    }

    if (vertical.length >= 3 && horizontal.length < 3) {
      cb(vertical.length);
      vertical.map((item) => {
        copy[item.row][item.col] = null;
      });

      return copy;
    }

    if (vertical.length >= 3 && horizontal.length >= 3) {
      cb(vertical.length + horizontal.length - 1);
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
    return board;
  },

  checkDefend: (board, row, col, cb) => {
    return board;
  },

  checkRecover: (board, row, col, cb) => {
    return board;
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

export default boardApi;
