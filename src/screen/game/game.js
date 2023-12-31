import React, { Component, useRef, useState, useEffect } from "react";
import {
  StyleSheet,
  Animated,
  Text,
  View,
  SafeAreaView,
  ImageBackground,
  Dimensions,
} from "react-native";
import { PanResponder } from "react-native";
import pieceApi from "../../apis/pieceApi";
import boardApi from "../../apis/boardApi";
import message from "../../apis/message";
import Header from "./header";
import StatusBar from "./status";
import Battle from "./battle";
import Controller from "./controller";
import Option from "./option";

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
        now_hp: 10,
      },
      status: {
        attack: 1,
        defend: 1,
        recover: 1,
        gold: 0,
      },

      /*GameInofs*/
      battle: false,
      battle_ongoing: false,
      floor: 1,
      score: 0,

      /*Status Object Position*/
      statusPotions: null,

      /*Showing Options*/
      option: false,

      /*Gamestart*/
      ts: new Date().getTime(),

      /*lang*/
      lang: "kr",
    };

    this.battleRef = React.createRef();
  }

  upFloor = (cb = null) => {
    const up = this.state.floor + 1;

    this.setState(
      {
        floor: up,
        battle: up >= 3 ? true : false,
      },
      () => {
        if (cb !== null) {
          cb();
        }
      }
    );
  };

  upScore = (value) => {
    const sc = this.state.score + value;

    this.setState({
      score: sc,
    });
  };

  goldUpdate = (value) => {
    const origin = this.state.status.gold;

    this.setState((prev) => ({
      status: {
        ...prev.status,
        gold: origin + value,
      },
    }));
  };

  attackUpdate = (value) => {
    const origin = this.state.status.attack;

    this.setState((prev) => ({
      status: {
        ...prev.status,
        attack: origin + value,
      },
    }));
  };

  defendUpdate = (value) => {
    const origin = this.state.status.defend;

    this.setState((prev) => ({
      status: {
        ...prev.status,
        defend: origin + value,
      },
    }));
  };

  recoverUpdate = (value) => {
    const origin = this.state.status.recover;

    this.setState((prev) => ({
      status: {
        ...prev.status,
        recover: origin + value,
      },
    }));
  };

  statusObjectPositions = (value) => {
    this.setState({
      statusPotions: value,
    });
  };

  optionToggle = () => {
    this.setState({
      option: !this.state.option,
    });
  };

  gameReset = () => {
    this.setState({
      user: {
        max_hp: 10,
        now_hp: 10,
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

      /*Showing Options*/
      option: false,

      /*Gamestart*/
      ts: new Date().getTime(),
    });
  };

  userMaxHpUpdate = (value, cb = null) => {
    const origin = this.state.user.max_hp;
    const now = this.state.user.now_hp;

    this.setState(
      (prev) => ({
        user: {
          ...prev.user,
          max_hp: origin + value,
          now_hp: now + value,
        },
      }),
      () => {
        if (cb !== null) {
          cb();
        }
      }
    );
  };

  runBattle = (monster) => {
    const userRun = this.battleRef.current?.userRunToMonster();
    const userBack = this.battleRef.current?.userBackFromMonster();
    let battle_close = false;

    userRun.start(async () => {
      /*가까이 가서 공격한다.*/
      const damege = this.state.status.attack - monster.defend;
      const user_hp = this.state.user.now_hp + damege;
      monster.hp = monster.hp - this.state.status.attack;

      await this.setState((prev) => ({
        user: {
          ...prev.user,
          now_hp: user_hp,
        },
      }));

      console.log(damege, user_hp, monster.hp);

      //전투가 안끝났으면
      if (!battle_close) {
        userBack.start(() => {
          this.runBattle(monster);
        });
      } else {
        //배틀 결과를 스테이트에 저장
      }
    });
  };

  processBattle = () => {
    this.setState(
      {
        battle_ongoing: true,
      },
      () => {
        const monster = {
          name: "슬라임",
          hp: 8,
          defend: 3,
        };
        const motion = this.battleRef.current.createAndDisplayMonster(monster);

        motion.start(() => {
          this.runBattle(monster);
        });
      }
    );
  };

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.state.option ? (
          <Option optionToggle={this.optionToggle} gameReset={this.gameReset} />
        ) : (
          <></>
        )}

        <View style={style.container}>
          <ImageBackground
            source={require("../../imgs/backgrounds/battle_sky.png")}
          >
            <View>
              <SafeAreaView>
                <Header
                  floor={this.state.floor}
                  score={this.state.score}
                  optionToggle={this.optionToggle}
                />
                <StatusBar
                  status={this.state.status}
                  user={this.state.user}
                  statusObjectPositions={this.statusObjectPositions}
                />
                <Battle ref={this.battleRef} />
              </SafeAreaView>
            </View>
          </ImageBackground>

          <Board
            user={this.state.user}
            upFloor={this.upFloor}
            upScore={this.upScore}
            battle={this.state.battle}
            battle_ongoing={this.state.battle_ongoing}
            floor={this.state.floor}
            score={this.state.score}
            processBattle={this.processBattle}
            /*스탯 업데이트 Props*/
            statusPotions={this.state.statusPotions}
            attackUpdate={this.attackUpdate}
            defendUpdate={this.defendUpdate}
            recoverUpdate={this.recoverUpdate}
            goldUpdate={this.goldUpdate}
            userMaxHpUpdate={this.userMaxHpUpdate}
            ts={this.state.ts}
            lang={this.state.lang}
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
      message: "블럭을 설치하십시오.",
    };

    this.boardRef = React.createRef();
    this.contollerRef = React.createRef();
    this.bg = require("../../imgs/backgrounds/board/origbig.png");
  }

  opacity = new Animated.Value(0);
  animatedX = new Animated.Value(300);

  componentDidMount() {
    this.showMessage();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.ts !== this.props.ts) {
      const resetBoard = [
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
      ];

      this.contollerRef.current.resetPiece();

      this.setState({
        board: resetBoard,
      });
    }

    if (prevState.message !== this.state.message) {
      this.showMessage();
    }
  }

  showMessage = () => {
    this.opacity.setValue(0);
    this.animatedX.setValue(300);

    Animated.parallel([
      Animated.timing(this.opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(this.animatedX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

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

        result.push(
          <Tile
            data={col}
            key={r + "_" + c}
            statusPotions={this.props.statusPotions}
          />
        );
      }
    }

    return result;
  };

  releasePiece = (pan, piece, px, py) => {
    if (this.props.battle_ongoing) {
      pan.setValue({ x: 0, y: 0 });
      return;
    }

    const releasePointPx = px + boardSizeDatas.elementWidth / 2;
    const releasePointPy = py + boardSizeDatas.elementWidth / 2;

    let origin_board = this.state.board;
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
        const row = releasedRow + rs;
        const col = releasedCol + cs;
        const origin_board_item = origin_board[row][col];

        if (origin_board_item === null) {
          origin_board[row][col] = piece[rs][cs];

          if (origin_board[row][col] !== null) {
            origin_board[row][col].consider = true;
            origin_board[row][col].row = row;
            origin_board[row][col].col = col;
          }
        }
      }
    }

    /*새로운 피스를 생성하고 메인타겟으로 옮긴다.*/
    this.contollerRef.current.createNewPiece();
    origin_board = this.elementCompleteCheck(
      origin_board,
      releasedRow,
      releasedCol
    );
    this.setState(
      {
        board: origin_board,
        //consider : true,
        consider_element_tr: [releasedRow, releasedCol], //방금 놓은 블럭의 0행 0열 데이터 (무르기 개발 대비)
      },
      () => {
        /*보드를 업데이트 하고, 전투를 시작한다.*/
        if (this.props.battle) {
          if (this.props.floor === 3) {
            this.setState({
              message: message.getMessage(this.props.lang, "start_battle"),
            });
          }

          this.props.userMaxHpUpdate(1, () => {
            const win = this.processBattle();
          });
        } else {
          this.props.userMaxHpUpdate(1, () => {
            this.props.upFloor(() => {
              this.setState({
                message: message.getMessage(
                  this.props.lang,
                  "phase_" + this.props.floor
                ),
              });
            });
          });
        }
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
    for (let r = 0; r <= 1; r++) {
      for (let c = 0; c <= 1; c++) {
        if (!board[row + r] || !board[row + r][col + c]) {
          continue;
        }

        const el = board[row + r][col + c];
        if (el !== null) {
          const name = el.name;

          if (name === "gold") {
            board = boardApi.checkGold(
              board,
              row + r,
              col + c,
              (value, score) => {
                this.props.goldUpdate(value);
                this.props.upScore(score);
              }
            );
          } else if (name === "attack") {
            board = boardApi.checkAttack(
              board,
              row + r,
              col + c,
              (value, score) => {
                this.props.attackUpdate(value);
                this.props.upScore(score);
              }
            );
          } else if (name === "defend") {
            board = boardApi.checkDefend(board, row + r, col + c, (value) => {
              this.props.defendUpdate(value);
            });
          } else if (name === "recover") {
            board = boardApi.checkRecover(board, row + r, col + c, (value) => {
              this.props.recoverUpdate(value);
            });
          }
        }
      }
    }

    return board;
  };

  processBattle = () => {
    const battle_result = this.props.processBattle();
    return battle_result;
  };

  render() {
    return (
      <View style={board.container}>
        <ImageBackground source={this.bg} resizeMode="cover">
          <View style={board.message.container}>
            <View style={board.message.mask}></View>
            <Animated.View
              style={[
                board.message.wrap,
                {
                  transform: [{ translateX: this.animatedX }],
                  opacity: this.opacity,
                },
              ]}
            >
              <Text style={board.message.msg}>{this.state.message}</Text>
            </Animated.View>
          </View>

          <View
            style={board.main}
            ref={this.boardRef}
            onLayout={this.componentMeasure}
          >
            {this.props.battle_ongoing ? (
              <View style={board.ongoing.mask}>
                <Text style={board.ongoing.text}>Battle</Text>
              </View>
            ) : (
              <></>
            )}
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
  const [prevData, setPrevData] = useState(props.data);
  const [effect, setEffect] = useState("");
  const EffectRef = useRef(null);

  useEffect(() => {
    if (props.data === null && prevData === null) {
      setEffect("");
    } else if (props.data !== null && prevData === null) {
      setEffect("insert");
    } else if (props.data === null && prevData !== null) {
      setEffect(prevData.name);
    }

    setPrevData(props.data);
  }, [props.data]);

  /*삭제 애니메이션*/
  const opacity = useRef(new Animated.Value(1)).current;
  const animatedX = useRef(new Animated.Value(0)).current;
  const animatedY = useRef(new Animated.Value(0)).current;

  const removeEffect = (item) => {
    EffectRef.current.measure((fx, fy, width, height, px, py) => {
      console.log(px, py);

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(animatedY, {
          toValue: props.statusPotions[item].py - py,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(animatedX, {
          toValue: props.statusPotions[item].px - px,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        animatedY.setValue(0);
        animatedX.setValue(0);
        setEffect("");
      });
    });
  };

  if (data === null) {
    return (
      <View
        ref={EffectRef}
        style={[
          {
            width: boardSizeDatas.elementWidth,
            height: boardSizeDatas.elementWidth,
          },
        ]}
      >
        <ImageBackground source={bg} style={{ flex: 1 }} resizeMode="contain">
          {effect !== "insert" && effect !== "" ? (
            <Animated.View
              style={[
                {
                  flex: 1,
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  opacity: opacity,
                },
                {
                  transform: [
                    { translateX: animatedX },
                    { translateY: animatedY },
                  ],
                },
              ]}
              onLayout={removeEffect(effect)}
            >
              <ImageBackground
                source={element_assets[effect]}
                style={{ flex: 1 }}
                resizeMode="contain"
              ></ImageBackground>
            </Animated.View>
          ) : (
            <></>
          )}
        </ImageBackground>
      </View>
    );
  } else {
    const source = element_assets[data.name];
    const remove = data.willRemove;

    return (
      <View
        style={{
          width: boardSizeDatas.elementWidth,
          height: boardSizeDatas.elementWidth,
          borderWidth: remove ? 4 : 0,
          zIndex: 20,
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
    resetPiece,
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

  const resetPiece = () => {
    setPieceData(pieceApi.createNewPiece());
    setNextPieceData(pieceApi.createNewPiece());
    setAfterNextPieceData(pieceApi.createNewPiece());
    setLastPieceData(pieceApi.createNewPiece());
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
      //height: boardSizeDatas.elementWidth * 2.5,
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
    height: boardSizeDatas.boardHeight + 12,
    flexDirection: "row",
    flexWrap: "wrap",
    alignSelf: "center",
    justifyContent: "center",
  },
  message: {
    container: {
      marginBottom: 6,
    },
    wrap: {
      marginLeft: 24,
      marginTop: 6,
      marginBottom: 6,
    },
    msg: {
      color: "#f5f5dc",
      fontSize: 16,
    },
    mask: {
      position: "absolute",
      top: 0,
      left: 0,
      backgroundColor: "black",
      height: "100%",
      width: "100%",
      opacity: 0.7,
    },
  },
  ongoing: {
    mask: {
      position: "absolute",
      top: 0,
      left: 0,
      width: boardSizeDatas.boardHeight,
      height: boardSizeDatas.boardHeight,
      backgroundColor: "black",
      opacity: "0.6",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 50,
      borderRadius: 6,
    },
    text: {
      color: "#f5f5dc",
      fontSize: 55,
      fontFamily: "Dungeon",
    },
  },
});

export default Game;
