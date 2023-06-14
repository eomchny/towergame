import React, { Component, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Animated,
  Text,
  View,
  Button,
  TextInput,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Alert,
  Dimensions,
} from "react-native";
import { PanResponder } from "react-native";
import pieceApi from "../../apis/pieceApi";
import Header from "./header";
import StatusBar from "./status";
import Battle from "./battle";
import Controller from "./controller";

const boardSize = 10;
const screenWidth = Dimensions.get("window").width;
const boardWidth =
  screenWidth - (34 % 2) !== 0 ? screenWidth - 35 : screenWidth - 34;
const boardSizeDatas = {
  boardWidth: boardWidth,
  boardHeight: boardWidth,
  elementWidth: boardWidth / boardSize,
};

/*Assets*/
const element_assets = {
  box: require("../../imgs/icons/element_box.png"),
  attack: require("../../imgs/icons/element_attack.png"),
  defend: require("../../imgs/icons/element_defend.png"),
  recover: require("../../imgs/icons/element_recover.png"),
  gold: require("../../imgs/icons/element_gold.png"),
  frame: require("../../imgs/icons/frame.png"),
};

class Game extends Component {
  constructor(props) {
    super(props);

    /*State*/
    this.state = {
      user: {
        max_hp: 10,
        now_hp: 9,
      },
      status: {
        attack: 1,
        defend: 1,
        recover: 1,
        gold: 0,
      },

      /*GameInofs*/
      battle: false,
      floor: 1,
      score: 0,
    };
  }

  upFloor = () => {
    const up = this.state.floor + 1;

    this.setState({
      floor: up,
      battle: up >= 4 ? true : false,
    });
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        <View style={style.container}>
          <ImageBackground
            source={require("../../imgs/backgrounds/battle_sky.png")}
          >
            <View>
              <SafeAreaView>
                <Header floor={this.state.floor} score={this.state.score} />
                <StatusBar status={this.state.status} user={this.state.user} />
                <Battle />
              </SafeAreaView>
            </View>
          </ImageBackground>

          <Board
            user={this.state.user}
            status={this.state.status}
            upFloor={this.upFloor}
            battle={this.state.battle}
            floor={this.state.floor}
            score={this.state.score}
          />
        </View>
      </View>
    );
  }
}

class Board extends Component {
  constructor(props) {
    super(props);

    /*State*/
    this.state = {
      board: [
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null, null, null],
      ],
      consider: false,
      consider_element_tr: [null, null],
    };

    this.boardRef = React.createRef();
    this.contollerRef = React.createRef();
    this.bg = require("../../imgs/backgrounds/board/origbig.png");
  }

  componentMeasure = async () => {
    this.boardRef.current.measure((fx, fy, width, height, px, py) => {
      this.setState({
        boardX: px,
        boardY: py,
        borderWidth: width,
        borderHeight: height,
      });
    });
  };

  getTiles = () => {
    const origin = this.state.board;
    const result = [];

    for (let r = 0; r < origin.length; r++) {
      const row = origin[r];

      for (let c = 0; c < row.length; c++) {
        const col = origin[r][c];

        result.push(<Tile data={col} key={r + "_" + c} row={r} col={c} />);
      }
    }

    return result;
  };

  releasePiece = (pan, piece, px, py) => {
    const releasePointPx = px + boardSizeDatas.elementWidth / 2;
    const releasePointPy = py + boardSizeDatas.elementWidth / 2;

    const origin_board = this.state.board;
    const releasedRow =
      parseInt(
        (releasePointPy - this.state.boardY) / boardSizeDatas.elementWidth
      ) - 2;
    const releasedCol =
      parseInt(
        (this.state.boardX + releasePointPx) / boardSizeDatas.elementWidth
      ) - 1;

    /*기준점에 보드 밖에 있음*/
    if (
      releasePointPx <= this.state.boardX ||
      releasePointPy <= this.state.boardY
    ) {
      pan.setValue({ x: 0, y: 0 });
      return;
    }

    /*0행 0열 (릴리즈포인트)가 마지막 열에 있는 경우*/
    if (releasedCol >= boardSize - 1) {
      if (!(piece[0][1] == null && piece[1][1] == null)) {
        pan.setValue({ x: 0, y: 0 });
        return;
      }
    }

    /*0행 0열 (릴리즈포인트)가 마지막 행에 있는 경우*/
    if (releasedRow >= boardSize - 1) {
      if (!(piece[1][0] == null && piece[1][1] == null)) {
        pan.setValue({ x: 0, y: 0 });
        return;
      }
    }

    /*겹치는 부분이 둘다 null이어야 넣을 수 있음*/
    for (let rs = 0; rs <= 1; rs++) {
      for (let cs = 0; cs <= 1; cs++) {
        const origin_board_item =
          origin_board[releasedRow + rs][releasedCol + cs];
        const released_item = piece[rs][cs];

        if (origin_board_item !== null && released_item !== null) {
          pan.setValue({ x: 0, y: 0 });
          return;
        }
      }
    }

    for (let rs = 0; rs <= 1; rs++) {
      for (let cs = 0; cs <= 1; cs++) {
        const origin_board_item =
          origin_board[releasedRow + rs][releasedCol + cs];

        if (origin_board_item === null) {
          origin_board[releasedRow + rs][releasedCol + cs] = piece[rs][cs];

          if (origin_board[releasedRow + rs][releasedCol + cs] !== null) {
            origin_board[releasedRow + rs][releasedCol + cs].consider = true;
          }
        }
      }
    }

    //마지막에 개발 -> 능력치 반영, 완성된 요소 삭제 어떻게 할건지
    this.elementCompleteCheck(origin_board, releasedRow, releasedCol);
    this.contollerRef.current.createNewPiece();
    this.props.upFloor();
    this.setState(
      {
        board: origin_board,
        //consider : true,
        consider_element_tr: [releasedRow, releasedCol], //방금 놓은 블럭의 0행 0열 데이터 (무르기 개발 대비)
      },
      () => {
        pan.setValue({ x: 0, y: 0 });
      }
    );
  };

  decidedPiece = () => {
    const origin_board = this.state.board;
    const based_row = this.state.consider_element_tr[0];
    const based_col = this.state.consider_element_tr[1];

    for (let rs = 0; rs <= 1; rs++) {
      for (let cs = 0; cs <= 1; cs++) {
        if (origin_board[based_row + rs][based_col + cs] !== null) {
          origin_board[based_row + rs][based_col + cs].decided = true;
        }
      }
    }

    this.setState(
      {
        board: origin_board,
        consider: false,
        consider_element_tr: [null, null],
      },
      () => {
        this.afterDecided(based_row, based_col);
      }
    );
  };

  cancelPiece = () => {
    const origin_board = this.state.board;
    const based_row = this.state.consider_element_tr[0];
    const based_col = this.state.consider_element_tr[1];

    for (let rs = 0; rs <= 1; rs++) {
      for (let cs = 0; cs <= 1; cs++) {
        const origin_board_item = origin_board[based_row + rs][based_col + cs];

        if (origin_board_item !== null && !origin_board_item.decided) {
          origin_board[based_row + rs][based_col + cs] = null;
        }
      }
    }

    this.setState({
      board: origin_board,
      consider: false,
      consider_element_tr: [null, null],
    });
  };

  elementCompleteCheck = (board, row, col) => {
    if (row === boardSize - 1) {
      return;
    }

    if (col === boardSize - 1) {
      return;
    }

    for (let r = 0; r <= 1; r++) {
      for (let c = 0; c <= 1; c++) {
        const el = board[row + r][col + c];

        if (el !== null) {
          if (el.name === "gold") {
            console.log("골드찾기");
          }
        }
      }
    }
  };

  discoverGold = (board, based_row, based_col) => {
    const base = board[based_row][based_col];
  };

  render() {
    return (
      <View style={board.container}>
        <ImageBackground source={this.bg} resizeMode="cover">
          <View
            style={board.main}
            ref={this.boardRef}
            onLayout={this.componentMeasure}
          >
            {this.getTiles()}
          </View>
        </ImageBackground>

        <PieceContoll
          ref={this.contollerRef}
          releasePiece={this.releasePiece}
          boardConsider={this.state.consider}
        />
      </View>
    );
  }
}

const Tile = (props) => {
  const bg = require("../../imgs/backgrounds/tile.png");
  const data = props.data;
  const row = props.row;
  const col = props.col;

  if (data === null) {
    return (
      <View
        style={[
          {
            width: boardSizeDatas.elementWidth,
            height: boardSizeDatas.elementWidth,
          },
        ]}
      >
        <ImageBackground source={bg} style={{ flex: 1 }} resizeMode="contain">
          <Text>{/*row+"-"+col*/}</Text>
        </ImageBackground>
      </View>
    );
  } else {
    const source = element_assets[data.name];

    return (
      <View
        style={{
          width: boardSizeDatas.elementWidth,
          height: boardSizeDatas.elementWidth,
        }}
      >
        <ImageBackground
          source={bg}
          style={{ flex: 1, padding: 1 }}
          resizeMode="contain"
        >
          <ImageBackground
            source={source}
            style={{ flex: 1 }}
            resizeMode="contain"
          ></ImageBackground>
        </ImageBackground>
      </View>
    );
  }
};

const PieceContoll = React.forwardRef((props, ref) => {
  const pieceRef = useRef(null);
  const nextPieceRef = useRef(null);
  const afterNextPieceRef = useRef(null);
  const lastPieceRef = useRef(null);

  const [pieceData, setPieceData] = useState([
    [null, null],
    [null, null],
  ]);
  const [nextPieceData, setNextPieceData] = useState([
    [null, null],
    [null, null],
  ]);
  const [afterNextPieceData, setAfterNextPieceData] = useState([
    [null, null],
    [null, null],
  ]);
  const [lastPieceData, setLastPieceData] = useState([
    [null, null],
    [null, null],
  ]);

  /*Control Buttons Press State*/

  useEffect(() => {
    setPieceData(pieceApi.createNewPiece());
    setNextPieceData(pieceApi.createNewPiece());
    setAfterNextPieceData(pieceApi.createNewPiece());
    setLastPieceData(pieceApi.createNewPiece());
  }, []);

  useEffect(() => {
    pieceRef.current.rotateReset();
  }, [pieceData]);

  React.useImperativeHandle(ref, () => ({
    createNewPiece,
  }));

  const pieceRotateLeft = () => {
    const new_matrix = [
      [pieceData[0][1], pieceData[1][1]],
      [pieceData[0][0], pieceData[1][0]],
    ];

    pieceRef.current.elementLoate("left", () => {
      setPieceData(new_matrix);
    });
  };

  const pieceRotateRight = () => {
    const new_matrix = [
      [pieceData[1][0], pieceData[0][0]],
      [pieceData[1][1], pieceData[0][1]],
    ];

    pieceRef.current.elementLoate("right", () => {
      setPieceData(new_matrix);
    });
  };

  const pieceRotateVertical = () => {
    const new_matrix = [
      [pieceData[0][1], pieceData[0][0]],
      [pieceData[1][1], pieceData[1][0]],
    ];

    pieceRef.current.elementLoate("vertical", () => {
      setPieceData(new_matrix);
    });
  };

  const pieceRotateHorizontal = () => {
    const new_matrix = [
      [pieceData[1][0], pieceData[1][1]],
      [pieceData[0][0], pieceData[0][1]],
    ];

    pieceRef.current.elementLoate("horizontal", () => {
      setPieceData(new_matrix);
    });
  };

  const createNewPiece = () => {
    Animated.parallel([
      nextPieceRef.current.moveRight(),
      afterNextPieceRef.current.moveRight(),
      lastPieceRef.current.moveRight(),
      pieceRef.current.afterDecidedOpacityAnimation(),
    ]).start(() => {
      setPieceData(nextPieceData);
      setNextPieceData(afterNextPieceData);
      setAfterNextPieceData(lastPieceData);
      setLastPieceData(pieceApi.createNewPiece());

      Animated.parallel([
        nextPieceRef.current.moveLeft(),
        afterNextPieceRef.current.moveLeft(),
        lastPieceRef.current.moveLeft(),
        pieceRef.current.moveCompleteOpacityAnimation(),
      ]).start();
    });
  };

  const el_size = boardSizeDatas.elementWidth;
  return (
    <ImageBackground
      source={require("../../imgs/backgrounds/controller_bg.png")}
      style={{ flex: 1 }}
      resizeMode="stretch"
    >
      <View style={piece.controller.whole}>
        <View style={piece.controller.container}>
          <NextPiece
            ref={lastPieceRef}
            pieceData={afterNextPieceData}
            type="last"
          />

          <NextPiece
            ref={afterNextPieceRef}
            pieceData={afterNextPieceData}
            type="after"
          />

          <NextPiece ref={nextPieceRef} pieceData={nextPieceData} type="next" />

          <Piece
            ref={pieceRef}
            releasePiece={props.releasePiece}
            pieceData={pieceData}
            boardConsider={props.boardConsider}
          />

          {/*보더를 감싸고 있는 프레임 디자인*/}
          <ImageBackground
            source={element_assets.frame}
            style={piece.frame}
            resizeMode="contain"
          ></ImageBackground>
        </View>

        <Controller
          elementWidth={boardSizeDatas.elementWidth}
          rotateLeft={pieceRotateLeft}
          rotateRight={pieceRotateRight}
          rotateVerticalt={pieceRotateVertical}
          rotateHorizontal={pieceRotateHorizontal}
        />
      </View>
    </ImageBackground>
  );
});

const NextPiece = React.forwardRef((props, ref) => {
  const type = props.type; //String type : next, after, last
  const pieceData = props.pieceData;

  /*애니메이션*/
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animatedStyle = {
    transform: [{ translateX: animatedValue }, { translateY: 0 }],
  };

  //블럭을 오른쪽에 있던 블럭 위치로 이동시키는 애니메이션
  const moveRight = () => {
    return Animated.timing(animatedValue, {
      toValue: boardSizeDatas.elementWidth * 2 + 5 + 24,
      duration: 250,
      useNativeDriver: true,
    });
  };

  //블럭을 왼쪽에 있던 블럭 위치로 이동시키는 애니메이션
  const moveLeft = () => {
    animatedValue.setValue(0);
  };

  //부모에게 함수를 사용할 수 있도록 전달
  React.useImperativeHandle(ref, () => ({
    moveRight,
    moveLeft,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <View style={[piece.next_piece, piece.next_piece.dynamicOpacity(type)]}>
        <Element data={pieceData[0][0]} row={0} col={0} />
        <Element data={pieceData[0][1]} row={0} col={1} />
        <Element data={pieceData[1][0]} row={1} col={0} />
        <Element data={pieceData[1][1]} row={1} col={1} />
      </View>
    </Animated.View>
  );
});

const Piece = React.forwardRef((props, ref) => {
  const pieceData = props.pieceData;
  const pieceRef = useRef();

  /*엘리멘트별 이동을 위한 Refs*/
  const r0_c0_ref = useRef();
  const r0_c1_ref = useRef();
  const r1_c0_ref = useRef();
  const r1_c1_ref = useRef();

  /*제스쳐*/
  const pan = useRef(new Animated.ValueXY()).current;
  const pieceResponder = PanResponder.create({
    onStartShouldSetPanResponder: (e, gestureState) => true,
    onMoveShouldSetPanResponder: (e, gestureState) => true,
    onPanResponderGrant: (e, gestureState) => {
      /*초기위치*/
      const { pageX, pageY } = e.nativeEvent;
    },
    onPanResponderMove: (e, gestureState) => {
      /*이동중인 위치*/
      const { dx, dy } = gestureState;
      pan.setValue({ x: dx, y: dy });
    },
    onPanResponderRelease: (e, gestureState) => {
      /*최종 위치*/
      const { pageX, pageY } = e.nativeEvent;
      releasePiece();
    },
  });

  /*결정 버튼을 눌렀을때, 서서히 사라지는 애니메이션*/
  const opacityAnimatedValue = useRef(new Animated.Value(1)).current;
  const opacityAnimatedStyle = { opacity: opacityAnimatedValue };
  const afterDecidedOpacityAnimation = () => {
    opacityAnimatedValue.setValue(0);
  };
  const moveCompleteOpacityAnimation = () => {
    opacityAnimatedValue.setValue(1);
  };

  /*피스를 보드 위에 올려 놓았을때*/
  const releasePiece = () => {
    pieceRef.current.measure((fx, fy, width, height, px, py) => {
      props.releasePiece(pan, pieceData, px, py);
    });
  };

  /*피스 회전시 엘리먼트 이동*/
  const elementLoate = (type, cb = null) => {
    const r0_c0 = r0_c0_ref.current.rotate(type);
    const r0_c1 = r0_c1_ref.current.rotate(type);
    const r1_c0 = r1_c0_ref.current.rotate(type);
    const r1_c1 = r1_c1_ref.current.rotate(type);
    const result = r0_c0.concat(r0_c1, r1_c0, r1_c1);

    Animated.parallel(result).start(() => {
      cb();
    });
  };

  const rotateReset = () => {
    r0_c0_ref.current.rotateReset();
    r0_c1_ref.current.rotateReset();
    r1_c0_ref.current.rotateReset();
    r1_c1_ref.current.rotateReset();
  };

  /*부모요소가 사용할 함수들*/
  React.useImperativeHandle(ref, () => ({
    afterDecidedOpacityAnimation,
    moveCompleteOpacityAnimation,
    elementLoate,
    rotateReset,
  }));

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateX: pan.x }, { translateY: pan.y }],
        },
        { zIndex: 1 },
        opacityAnimatedStyle,
      ]}
      {...pieceResponder.panHandlers}
      ref={pieceRef}
    >
      <View style={piece.piece}>
        <Element ref={r0_c0_ref} data={pieceData[0][0]} row={0} col={0} />
        <Element ref={r0_c1_ref} data={pieceData[0][1]} row={0} col={1} />
        <Element ref={r1_c0_ref} data={pieceData[1][0]} row={1} col={0} />
        <Element ref={r1_c1_ref} data={pieceData[1][1]} row={1} col={1} />
      </View>
    </Animated.View>
  );
});

const Element = React.forwardRef((props, ref) => {
  const data = props.data;

  /*애니메이션 정의*/
  const animatedValueX = useRef(new Animated.Value(0)).current;
  const animatedValueY = useRef(new Animated.Value(0)).current;
  const animatedStyle = {
    transform: [{ translateX: animatedValueX }, { translateY: animatedValueY }],
  };
  const rotateDuration = 150;

  /*애니메이션 실행 함수들*/
  const rotate = (type) => {
    const row = props.row;
    const col = props.col;

    if (type === "left") {
      return rotateLeft(row, col);
    } else if (type === "right") {
      return rotateRight(row, col);
    } else if (type === "vertical") {
      return rotateVertical(row, col);
    } else if (type === "horizontal") {
      return rotateHorizontal(row, col);
    }
  };

  const rotateLeft = (row, col) => {
    let x_result;
    let y_result;
    if (row === 0 && col === 0) {
      x_result = 0;
      y_result = boardSizeDatas.elementWidth;
    } else if (row === 0 && col === 1) {
      x_result = -boardSizeDatas.elementWidth;
      y_result = 0;
    } else if (row === 1 && col === 0) {
      x_result = boardSizeDatas.elementWidth;
      y_result = 0;
    } else if (row === 1 && col === 1) {
      x_result = 0;
      y_result = -boardSizeDatas.elementWidth;
    }
    return [
      Animated.timing(animatedValueX, {
        toValue: x_result,
        duration: rotateDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValueY, {
        toValue: y_result,
        duration: rotateDuration,
        useNativeDriver: true,
      }),
    ];
  };

  const rotateRight = (row, col) => {
    let x_result;
    let y_result;
    if (row === 0 && col === 0) {
      x_result = boardSizeDatas.elementWidth;
      y_result = 0;
    } else if (row === 0 && col === 1) {
      x_result = 0;
      y_result = boardSizeDatas.elementWidth;
    } else if (row === 1 && col === 0) {
      x_result = 0;
      y_result = -boardSizeDatas.elementWidth;
    } else if (row === 1 && col === 1) {
      x_result = -boardSizeDatas.elementWidth;
      y_result = 0;
    }
    return [
      Animated.timing(animatedValueX, {
        toValue: x_result,
        duration: rotateDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValueY, {
        toValue: y_result,
        duration: rotateDuration,
        useNativeDriver: true,
      }),
    ];
  };

  const rotateHorizontal = (row, col) => {
    let x_result;
    let y_result;
    if (row === 0 && col === 0) {
      x_result = 0;
      y_result = boardSizeDatas.elementWidth;
    } else if (row === 0 && col === 1) {
      x_result = 0;
      y_result = boardSizeDatas.elementWidth;
    } else if (row === 1 && col === 0) {
      x_result = 0;
      y_result = -boardSizeDatas.elementWidth;
    } else if (row === 1 && col === 1) {
      x_result = 0;
      y_result = -boardSizeDatas.elementWidth;
    }
    return [
      Animated.timing(animatedValueX, {
        toValue: x_result,
        duration: rotateDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValueY, {
        toValue: y_result,
        duration: rotateDuration,
        useNativeDriver: true,
      }),
    ];
  };

  const rotateVertical = (row, col) => {
    let x_result;
    let y_result;
    if (row === 0 && col === 0) {
      x_result = boardSizeDatas.elementWidth;
      y_result = 0;
    } else if (row === 0 && col === 1) {
      x_result = -boardSizeDatas.elementWidth;
      y_result = 0;
    } else if (row === 1 && col === 0) {
      x_result = boardSizeDatas.elementWidth;
      y_result = 0;
    } else if (row === 1 && col === 1) {
      x_result = -boardSizeDatas.elementWidth;
      y_result = 0;
    }
    return [
      Animated.timing(animatedValueX, {
        toValue: x_result,
        duration: rotateDuration,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValueY, {
        toValue: y_result,
        duration: rotateDuration,
        useNativeDriver: true,
      }),
    ];
  };

  const rotateReset = () => {
    animatedValueX.setValue(0);
    animatedValueY.setValue(0);
  };

  React.useImperativeHandle(ref, () => ({
    rotate,
    rotateReset,
  }));

  if (data) {
    const source = element_assets[data.name];
    return (
      <Animated.View style={[piece.el, animatedStyle]}>
        <ImageBackground
          source={source}
          style={{ flex: 1 }}
          resizeMode="contain"
        ></ImageBackground>
      </Animated.View>
    );
  } else {
    return <View style={piece.el}></View>;
  }
});

const style = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const piece = StyleSheet.create({
  piece: {
    width: boardSizeDatas.elementWidth * 2 + 2,
    height: boardSizeDatas.elementWidth * 2 + 2,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  next_piece: {
    width: boardSizeDatas.elementWidth * 2 + 2,
    height: boardSizeDatas.elementWidth * 2 + 2,
    flexDirection: "row",
    flexWrap: "wrap",
    marginRight: 27,
    justifyContent: "center",
    alignItems: "center",
    dynamicOpacity: (type) => {
      const opacity =
        type === "next"
          ? "0.7"
          : type === "after"
          ? "0.4"
          : type === "last"
          ? "0.1"
          : "0";
      return {
        opacity: opacity,
      };
    },
  },
  el: {
    width: boardSizeDatas.elementWidth,
    height: boardSizeDatas.elementWidth,
  },
  frame: {
    position: "absolute",
    width: boardSizeDatas.elementWidth * 2 + 2 + 14,
    height: boardSizeDatas.elementWidth * 2 + 2 + 14,
    right: 41, //controller.container.paddingRight - 위에 절반
  },
  controller: {
    whole: {
      height: boardSizeDatas.elementWidth * 3,
      width: "100%",
      flexDirection: "row",
      flex: 1,
      alignItems: "center",
    },
    container: {
      flexDirection: "row",
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-end",
      flexWrap: "nowrap",
      paddingRight: 48,
    },
  },
});

const board = StyleSheet.create({
  container: {
    flex: 1,
  },
  main: {
    width: boardSizeDatas.boardWidth,
    height: boardSizeDatas.boardHeight + 28,
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "center",
    paddingBottom: 14,
    paddingTop: 14,
  },
});

export default Game;
