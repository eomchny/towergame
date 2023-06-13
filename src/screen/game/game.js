import React, { Component, useRef, useState, useEffect } from 'react';
import { StyleSheet, Animated, Text, View, Button, TextInput, SafeAreaView, ScrollView, TouchableOpacity, Image, ImageBackground, Alert, Dimensions } from 'react-native';
import { PanResponder } from 'react-native';
import pieceApi from '../../apis/pieceApi';

const boardSize = 10;
const screenWidth = Dimensions.get('window').width;
const boardWidth = (screenWidth-34%2 !== 0) ? screenWidth-35 : screenWidth-34;
const headerHeight = 130;
const boardSizeDatas = {
  boardWidth    : boardWidth,
  boardHeight   : boardWidth,
  elementWidth  : boardWidth/boardSize,
}

/*Assets*/
const element_assets = {
  box     : require('../../imgs/icons/element_box.png'),
  attack  : require('../../imgs/icons/element_attack.png'),
  defend  : require('../../imgs/icons/element_defend.png'),
  recover : require('../../imgs/icons/element_recover.png'),
  gold    : require('../../imgs/icons/element_gold.png'),
  frame   : require('../../imgs/icons/frame.png')
};

const button_assets = {
  decide_available : require('../../imgs/buttons/decide_available.png'),
  decide_disable   : require('../../imgs/buttons/decide_disable.png'),
  cancel_available : require('../../imgs/buttons/cancel_available.png'),
  cancel_disable   : require('../../imgs/buttons/cancel_disable.png'),
  /*Controll_buttons*/
  cancel_press_in             : require('../../imgs/buttons/cancel_press_in.png'),
  cancel_press_out            : require('../../imgs/buttons/cancel_press_out.png'),
  decide_press_in             : require('../../imgs/buttons/decide_press_in.png'),
  decide_press_out            : require('../../imgs/buttons/decide_press_out.png'),
  rotate_left_press_in        : require('../../imgs/buttons/rotate_left_press_in.png'),
  rotate_left_press_out       : require('../../imgs/buttons/rotate_left_press_out.png'),
  rotate_right_press_in       : require('../../imgs/buttons/rotate_right_press_in.png'),
  rotate_right_press_out      : require('../../imgs/buttons/rotate_right_press_out.png'),
  rotate_vertical_press_in    : require('../../imgs/buttons/rotate_vertical_press_in.png'),
  rotate_vertical_press_out   : require('../../imgs/buttons/rotate_vertical_press_out.png'),
  rotate_horizontal_press_in  : require('../../imgs/buttons/rotate_horizontal_press_in.png'),
  rotate_horizontal_press_out : require('../../imgs/buttons/rotate_horizontal_press_out.png'),
};

const status_assets = {
  back    : require('../../imgs/backgrounds/controller_bg.png'),
  attack  : require('../../imgs/icons/status/attack.png'),
  defend  : require('../../imgs/icons/status/defend.png'),
  recover : require('../../imgs/icons/status/recover.png'),
  gold    : require('../../imgs/icons/status/gold.png'),
  heart   : require('../../imgs/icons/status/heart.png')
};

class Game extends Component {
  constructor(props) {
    super(props);

    /*State*/
    this.state = {

      user : {
        max_hp : 10,
        now_hp : 9
      },
      status : {
        attack  : 1,
        defend  : 1,
        recover : 1,
        gold    : 0
      },

      /*GameInofs*/
      battle : false,
      floor : 1,
      score : 0
    }
  }

  upFloor = () => {
    const up = this.state.floor+1;

    this.setState({
      floor : up,
      battle : (up>=4) ? true : false
    })
  }

  render() {
		return (
      <View style={{flex:1}}>
        <View style={style.container}>

          <Board
            user={this.state.user}
            status={this.state.status}
            upFloor={this.upFloor}
            battle={this.state.battle}
            floor={this.state.floor}
            battle={this.state.battle}
            score={this.state.score}
          />

          <Battle/>
        </View>
      </View>
		)
  }
}

class Header extends Component {
  constructor(props) {
    super(props);

    /*State*/
    this.state = {
    }
  }

  render() {
		return (
      <View style={header.container}>
        <View style={header.wrap}>
          <View style={header.phase}>
            <Text style={header.label} >Phase</Text>
            <Text style={header.value}>{this.props.floor}</Text>
          </View>

          <View style={header.score}>
            <Text style={header.label}>Score</Text>
            <Text style={header.value}>{this.props.score}</Text>
          </View>

          <View style={header.setting}>
            <Text style={header.label}>Option</Text>
          </View>
        </View>
      </View>
		)
  }
}

class Board extends Component {
  constructor(props) {
    super(props);

    /*State*/
    this.state = {
      board : [
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
        [null,null,null,null,null,null,null,null,null,null],
      ],
      consider : false,
      consider_element_tr : [null,null]
    }

    this.boardRef = React.createRef();
    this.contollerRef = React.createRef();
    this.bg = require('../../imgs/backgrounds/board/origbig.png');
  }

  componentMeasure = async () => {
    this.boardRef.current.measure( (fx, fy, width, height, px, py) => {
      this.setState({
        boardX : px,
        boardY : py,
        borderWidth : width,
        borderHeight : height
      });
    });
  }

  getTiles = () => {
    const origin = this.state.board;
    const result = [];

    for (let r = 0; r < origin.length; r++) {
      const row = origin[r];

      for (let c = 0; c < row.length; c++) {
        const col = origin[r][c];

        result.push(
          <Tile data={col} key={r+"_"+c} row={r} col={c}/>
        )
      }
    }

    return result;
  }

  releasePiece = (pan, piece, px, py) => {
    const releasePointPx =  px+(boardSizeDatas.elementWidth/2);
    const releasePointPy =  py+(boardSizeDatas.elementWidth/2);

    const origin_board = this.state.board;
    const releasedRow = parseInt((releasePointPy-this.state.boardY)/boardSizeDatas.elementWidth);
    const releasedCol = parseInt((this.state.boardX+releasePointPx)/boardSizeDatas.elementWidth)-1;

    /*기준점에 보드 밖에 있음*/
    if (releasePointPx <=  this.state.boardX || releasePointPy <= this.state.boardY) {
      pan.setValue({ x: 0, y: 0});
      return;
    }

    /*피스의 엘리먼트중에 보드 안에 들어가지 않는게 있음*/
    if (releasedRow >= boardSize-1 || releasedCol >= boardSize-1) {
      pan.setValue({ x: 0, y: 0});
      return;
    }

    /*겹치는 부분이 둘다 null이어야 넣을 수 있음*/
    for (let rs=0; rs<=1; rs++) {
      for (let cs=0; cs<=1; cs++) {
        const origin_board_item = origin_board[releasedRow+rs][releasedCol+cs];
        const released_item = piece[rs][cs];

        if ( origin_board_item!==null && released_item!==null ) {
          pan.setValue({ x: 0, y: 0});
          return;
        }
      }
    }

    for (let rs=0; rs<=1; rs++) {
      for (let cs=0; cs<=1; cs++) {
        const origin_board_item = origin_board[releasedRow+rs][releasedCol+cs];

        if (origin_board_item === null) {
          origin_board[releasedRow+rs][releasedCol+cs] = piece[rs][cs];

          if (origin_board[releasedRow+rs][releasedCol+cs] !== null) {
            origin_board[releasedRow+rs][releasedCol+cs].consider = true;
          }
        }
      }
    }

    //마지막에 개발 -> 능력치 반영, 완성된 요소 삭제 어떻게 할건지
    this.contollerRef.current.createNewPiece();
    this.props.upFloor();
    this.setState({
      board : origin_board,
      //consider : true,
      consider_element_tr : [releasedRow, releasedCol] //방금 놓은 블럭의 0행 0열 데이터 (무르기 개발 대비)
    }, () => {
      pan.setValue({ x: 0, y: 0});
    })
  }

  decidedPiece = () => {
    const origin_board = this.state.board;
    const based_row = this.state.consider_element_tr[0];
    const based_col = this.state.consider_element_tr[1];

    for (let rs=0; rs<=1; rs++) {
      for (let cs=0; cs<=1; cs++) {
        if (origin_board[based_row+rs][based_col+cs] !== null) {
          origin_board[based_row+rs][based_col+cs].decided = true;
        }
      }
    }

    this.setState({
      board    : origin_board,
      consider : false,
      consider_element_tr : [null, null]
    }, () => {
      this.afterDecided(based_row, based_col);
    });
  }

  cancelPiece = () => {
    const origin_board = this.state.board;
    const based_row = this.state.consider_element_tr[0];
    const based_col = this.state.consider_element_tr[1];

    for (let rs=0; rs<=1; rs++) {
      for (let cs=0; cs<=1; cs++) {
        const origin_board_item = origin_board[based_row+rs][based_col+cs];

        if (origin_board_item !== null && !origin_board_item.decided) {
          origin_board[based_row+rs][based_col+cs] = null;
        }
      }
    }

    this.setState({
      board    : origin_board,
      consider : false,
      consider_element_tr : [null, null]
    });
  }

  afterDecided = (based_row, based_col) => {
    /*
    블럭을 놓는다
    => 완성된 요소가 있는지 확인한다
    => 완성된 요소를 확인하고 능력치에 반영한다
    => 완성된 요소를 삭제한다
    =>배틀
    =>이기면 층을 올린다
    */

    this.props.upFloor();
    this.contollerRef.current.createNewPiece();
  }

  elementCompleteCheck = () => {
    //완성된 요소가 있는지 확인
  }

  render() {
    return (
      <View style={board.container}>
        <ImageBackground source={this.bg} resizeMode="cover">
          <Header
            floor={this.props.floor}
            battle={this.props.battle}
            score={this.props.score}
          />

          <View
            style = {board.main}
            ref = {this.boardRef}
            onLayout = {this.componentMeasure}
          >
            {this.getTiles()}
          </View>
        </ImageBackground>

        <ImageBackground source={status_assets.back} resizeMode="stretch">
          <Status
            user={this.props.user}
            status={this.props.status}
            boardConsider={this.state.consider}
            decidedPiece={this.decidedPiece}
            cancelPiece={this.cancelPiece}
          />

          <PieceContoll
            ref={this.contollerRef}
            releasePiece = {this.releasePiece}
            boardConsider={this.state.consider}
          />
        </ImageBackground>
      </View>
    )
  }
}

const Tile = (props) => {
  const bg = require('../../imgs/backgrounds/tile.png');
  const data = props.data;
  const row = props.row;
  const col = props.col;

  if (data === null) {
    return (
      <View style={[{
        width:boardSizeDatas.elementWidth,
        height:boardSizeDatas.elementWidth,
      }]}
      >
        <ImageBackground source={bg} style={{ flex: 1}} resizeMode="contain">
        <Text>
          {/*row+"-"+col*/}
        </Text>
        </ImageBackground>
      </View>
    )
  } else {
    const source = element_assets[data.name];

    return (
      <View style={{
        width:boardSizeDatas.elementWidth,
        height:boardSizeDatas.elementWidth,
      }}
      >
        <ImageBackground source={bg} style={{ flex: 1,  padding: 1}} resizeMode="contain">
          <ImageBackground source={source} style={{ flex: 1}} resizeMode="contain">
          </ImageBackground>
        </ImageBackground>
      </View>
    )
  }
}

const PieceContoll = React.forwardRef((props, ref) => {
  const pieceRef          = useRef(null);
  const nextPieceRef      = useRef(null);
  const afterNextPieceRef = useRef(null);
  const lastPieceRef      = useRef(null);

  const [pieceData, setPieceData]                     = useState([[null,null],[null,null]]);
  const [nextPieceData, setNextPieceData]             = useState([[null,null],[null,null]]);
  const [afterNextPieceData, setAfterNextPieceData]   = useState([[null,null],[null,null]]);
  const [lastPieceData, setLastPieceData]             = useState([[null,null],[null,null]]);

  /*Control Buttons Press State*/
  const [rotateLeftPressIn      , setRotateLeftPressIn]       = useState(false);
  const [rotateRightPressIn     , setRotateRightPressIn]      = useState(false);
  const [rotateVerticalPressIn  , setRotateVerticalPressIn]   = useState(false);
  const [rotateHorizontalPressIn, setRotateHorizontalPressIn] = useState(false);

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
    createNewPiece
  }));

  const pieceRotateLeft = () => {
    const new_matrix = [
      [pieceData[0][1], pieceData[1][1]],
      [pieceData[0][0], pieceData[1][0]]
    ]

    pieceRef.current.elementLoate('left', ()=>{
      setPieceData(new_matrix);
    });
  }

  const pieceRotateRight = () => {
    const new_matrix = [
      [pieceData[1][0], pieceData[0][0]],
      [pieceData[1][1], pieceData[0][1]]
    ]

    pieceRef.current.elementLoate('right', ()=>{
      setPieceData(new_matrix);
    });
  }

  const pieceRotateVertical = () => {
    const new_matrix = [
      [pieceData[0][1], pieceData[0][0]],
      [pieceData[1][1], pieceData[1][0]]
    ]

    pieceRef.current.elementLoate('vertical', ()=>{
      setPieceData(new_matrix);
    });
  }

  const pieceRotateHorizontal = () => {
    const new_matrix = [
      [pieceData[1][0], pieceData[1][1]],
      [pieceData[0][0], pieceData[0][1]]
    ]

    pieceRef.current.elementLoate('horizontal', ()=>{
      setPieceData(new_matrix);
    });
  }

  const createNewPiece = () => {
    Animated.parallel([
      nextPieceRef.current.moveRight(),
      afterNextPieceRef.current.moveRight(),
      lastPieceRef.current.moveRight(),
      pieceRef.current.afterDecidedOpacityAnimation()]
    ).start(()=>{
      setPieceData(nextPieceData);
      setNextPieceData(afterNextPieceData);
      setAfterNextPieceData(lastPieceData);
      setLastPieceData(pieceApi.createNewPiece());

      Animated.parallel([
        nextPieceRef.current.moveLeft(),
        afterNextPieceRef.current.moveLeft(),
        lastPieceRef.current.moveLeft(),
        pieceRef.current.moveCompleteOpacityAnimation()]
      ).start();
    });
  }

  return (
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

        <NextPiece
          ref={nextPieceRef}
          pieceData={nextPieceData}
          type="next"
        />

        <Piece
          ref={pieceRef}
          releasePiece={props.releasePiece}
          pieceData={pieceData}
          boardConsider={props.boardConsider}
        />

        {/*보더를 감싸고 있는 프레임 디자인*/}
        <ImageBackground source={element_assets.frame} style={piece.frame} resizeMode="contain">
        </ImageBackground>
      </View>

      <View style={{width:boardSizeDatas.elementWidth*3, flexDirection:'row', flexWrap:'wrap'}}>
        <View style={{height:'50%', width:'50%'}}>
          <ImageBackground source={(rotateLeftPressIn) ? button_assets.rotate_left_press_in : button_assets.rotate_left_press_out} style={{ flex: 1 }} resizeMode="contain">
            <TouchableOpacity onPress={pieceRotateLeft} onPressIn={()=>{setRotateLeftPressIn(true)}} onPressOut={()=>{setRotateLeftPressIn(false)}} style={{flex:1}}>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View style={{height:'50%', width:'50%'}}>
          <ImageBackground source={(rotateRightPressIn) ? button_assets.rotate_right_press_in : button_assets.rotate_right_press_out} style={{ flex: 1 }} resizeMode="contain">
            <TouchableOpacity onPress={pieceRotateRight} onPressIn={()=>{setRotateRightPressIn(true)}} onPressOut={()=>{setRotateRightPressIn(false)}} style={{flex:1}}>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View style={{height:'50%', width:'50%', right: 16}}>
          <ImageBackground source={(rotateVerticalPressIn) ? button_assets.rotate_vertical_press_in : button_assets.rotate_vertical_press_out} style={{ flex: 1 }} resizeMode="contain">
            <TouchableOpacity onPress={pieceRotateVertical} onPressIn={()=>{setRotateVerticalPressIn(true)}} onPressOut={()=>{setRotateVerticalPressIn(false)}} style={{flex:1}}>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View style={{height:'50%', width:'50%', right: 16}}>
          <ImageBackground source={(rotateHorizontalPressIn) ? button_assets.rotate_horizontal_press_in : button_assets.rotate_horizontal_press_out} style={{ flex: 1 }} resizeMode="contain">
            <TouchableOpacity onPress={pieceRotateHorizontal} onPressIn={()=>{setRotateHorizontalPressIn(true)}} onPressOut={()=>{setRotateHorizontalPressIn(false)}} style={{flex:1}}>
            </TouchableOpacity>
          </ImageBackground>
        </View>
      </View>
    </View>
  )
});

const NextPiece = React.forwardRef((props, ref) => {
  const type      = props.type; //String type : next, after, last
  const pieceData = props.pieceData;

  /*애니메이션*/
  const animatedValue = useRef(new Animated.Value(0)).current;
  const animatedStyle = {  transform: [{translateX: animatedValue}, {translateY: 0}] };

  //블럭을 오른쪽에 있던 블럭 위치로 이동시키는 애니메이션
  const moveRight = () => {
    return Animated.timing(animatedValue, {
        toValue: boardSizeDatas.elementWidth*2+5+24,
        duration: 250,
        useNativeDriver: true,
    });
  }

  //블럭을 왼쪽에 있던 블럭 위치로 이동시키는 애니메이션
  const moveLeft = () => {
    animatedValue.setValue(0);
  }

  //부모에게 함수를 사용할 수 있도록 전달
  React.useImperativeHandle(ref, () => ({
    moveRight,
    moveLeft
  }));

  return (
    <Animated.View style={animatedStyle}>
       <View style={[piece.next_piece, piece.next_piece.dynamicOpacity(type)]}>
         <Element data={pieceData[0][0]} row={0} col={0}/>
         <Element data={pieceData[0][1]} row={0} col={1}/>
         <Element data={pieceData[1][0]} row={1} col={0}/>
         <Element data={pieceData[1][1]} row={1} col={1}/>
       </View>
     </Animated.View>
  )
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
    onStartShouldSetPanResponder  : (e, gestureState) => true,
    onMoveShouldSetPanResponder   : (e, gestureState) => true,
    onPanResponderGrant           : (e, gestureState) => {
      /*초기 위치*/
      const { pageX, pageY } = e.nativeEvent;
    },
    onPanResponderMove            : (e, gestureState) => {
      /*이동중인 위치*/
      const { dx, dy } = gestureState;
      pan.setValue({ x: dx, y: dy });
    },
    onPanResponderRelease         : (e, gestureState) => {
      /*최종 위치*/
      const { pageX, pageY } = e.nativeEvent;
      releasePiece();
    },
  });

  /*결정 버튼을 눌렀을때, 서서히 사라지는 애니메이션*/
  const opacityAnimatedValue = useRef(new Animated.Value(1)).current;
  const opacityAnimatedStyle = { opacity : opacityAnimatedValue };
  const afterDecidedOpacityAnimation = () => {
    //결정 버튼을 눌렀을때, 다음 블럭이 오는 동안 서서히 opacity를 낮추어 사라지게 함
    opacityAnimatedValue.setValue(0);

    /*return Animated.timing(opacityAnimatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
    });*/
  }
  const moveCompleteOpacityAnimation = () => {
    //이동이 완료되었을때, 다시 보이게 한다.
    opacityAnimatedValue.setValue(1);
  }

  /*피스를 보드 위에 올려 놓았을때*/
  const releasePiece = () => {
    pieceRef.current.measure( (fx, fy, width, height, px, py) => {
      props.releasePiece(pan, pieceData, px, py);
    });
  }

  /*피스 회전시 엘리먼트 이동*/
  const elementLoate = (type, cb=null) => {
    const r0_c0 = r0_c0_ref.current.rotate(type);
    const r0_c1 = r0_c1_ref.current.rotate(type);
    const r1_c0 = r1_c0_ref.current.rotate(type);
    const r1_c1 = r1_c1_ref.current.rotate(type);
    const result = r0_c0.concat(r0_c1, r1_c0, r1_c1);

    Animated.parallel(
      result
    ).start(()=>{
      cb();
    });
  }

  const rotateReset = () => {
    const r0_c0 = r0_c0_ref.current.rotateReset();
    const r0_c1 = r0_c1_ref.current.rotateReset();
    const r1_c0 = r1_c0_ref.current.rotateReset();
    const r1_c1 = r1_c1_ref.current.rotateReset();
  }

  /*부모요소가 사용할 함수들*/
  React.useImperativeHandle(ref, () => ({
    afterDecidedOpacityAnimation,
    moveCompleteOpacityAnimation,
    elementLoate,rotateReset
  }));

  return (
    <Animated.View
      style={[{
        transform: [{translateX: pan.x}, {translateY: pan.y}],
      }, {zIndex:1},(props.boardConsider) ? {opacity:'0.7'} : opacityAnimatedStyle]}
      {...pieceResponder.panHandlers}
      ref={pieceRef}
     >
       <View style={piece.piece}>
         <Element ref={r0_c0_ref} data={pieceData[0][0]} row={0} col={0}/>
         <Element ref={r0_c1_ref} data={pieceData[0][1]} row={0} col={1}/>
         <Element ref={r1_c0_ref} data={pieceData[1][0]} row={1} col={0}/>
         <Element ref={r1_c1_ref} data={pieceData[1][1]} row={1} col={1}/>
       </View>
     </Animated.View>
  )
});

const Element = React.forwardRef((props, ref) => {
  const data = props.data;

  /*애니메이션 정의*/
  const animatedValueX = useRef(new Animated.Value(0)).current;
  const animatedValueY = useRef(new Animated.Value(0)).current;
  const animatedStyle = {  transform: [{translateX: animatedValueX}, {translateY: animatedValueY}] };
  const rotateDuration = 150

  /*애니메이션 실행 함수들*/
  const rotate = (type) => {
    const row = props.row;
    const col = props.col;

    if (type === 'left') {
      return rotateLeft(row, col);
    } else if (type === 'right') {
      return rotateRight(row, col);
    } else if (type === 'vertical') {
      return rotateVertical(row, col);
    } else if (type === 'horizontal') {
      return rotateHorizontal(row, col);
    }
  }

  const rotateLeft = (row, col) => {
    let x_result; let y_result;
    if(row===0 && col===0) {
      x_result=0; y_result=boardSizeDatas.elementWidth;
    } else if (row===0 && col===1) {
      x_result=-boardSizeDatas.elementWidth; y_result=0;
    } else if (row===1 && col===0) {
      x_result=boardSizeDatas.elementWidth; y_result=0;
    } else if (row===1 && col===1) {
      x_result=0; y_result=-boardSizeDatas.elementWidth;
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
      })
    ]
  }

  const rotateRight = (row, col) => {
    let x_result; let y_result;
    if(row===0 && col===0) {
      x_result=boardSizeDatas.elementWidth; y_result=0;
    } else if (row===0 && col===1) {
      x_result=0; y_result=boardSizeDatas.elementWidth;
    } else if (row===1 && col===0) {
      x_result=0; y_result=-boardSizeDatas.elementWidth;
    } else if (row===1 && col===1) {
      x_result=-boardSizeDatas.elementWidth; y_result=0;
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
      })
    ]
  }

  const rotateHorizontal = (row, col) => {
    let x_result; let y_result;
    if(row===0 && col===0) {
      x_result=0; y_result=boardSizeDatas.elementWidth;
    } else if (row===0 && col===1) {
      x_result=0; y_result=boardSizeDatas.elementWidth;
    } else if (row===1 && col===0) {
      x_result=0; y_result=-boardSizeDatas.elementWidth;
    } else if (row===1 && col===1) {
      x_result=0; y_result=-boardSizeDatas.elementWidth;
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
      })
    ]
  }

  const rotateVertical = (row, col) => {
    let x_result; let y_result;
    if(row===0 && col===0) {
      x_result=boardSizeDatas.elementWidth; y_result=0;
    } else if (row===0 && col===1) {
      x_result=-boardSizeDatas.elementWidth; y_result=0;
    } else if (row===1 && col===0) {
      x_result=boardSizeDatas.elementWidth; y_result=0;
    } else if (row===1 && col===1) {
      x_result=-boardSizeDatas.elementWidth; y_result=0;
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
      })
    ]
  }

  const rotateReset = () => {
    animatedValueX.setValue(0);
    animatedValueY.setValue(0);
  }

  React.useImperativeHandle(ref, () => ({
    rotate,
    rotateReset
  }));

  if (data) {
    const source = element_assets[data.name];
    return (
      <Animated.View style={[piece.el, animatedStyle]}>
        <ImageBackground source={source} style={{ flex: 1}} resizeMode="contain">
        </ImageBackground>
      </Animated.View>
    )
  } else {
    return (
      <View style={piece.el}>
      </View>
    )
  }
});

const Battle = (props) => {
  /*Assets*/
  const bg_assets = {
    top : require('../../imgs/backgrounds/battle_top.png'),
    cloud : require('../../imgs/backgrounds/battle_sky.png'),
    sky : require('../../imgs/backgrounds/battle_cloud.png'),
    bottom  : require('../../imgs/backgrounds/battle_bottom.png'),
  };
  const ch_assets = {
    moving_0 : require('../../imgs/character/moving_0.png'),
    moving_1 : require('../../imgs/character/moving_1.png'),
  };

  /*State*/
  const [userAnimationImage, setUserAnimationImage] = useState("0");

  /*애니메이션*/
  const userInitAnimationValue = useRef(new Animated.Value(-64)).current;
  const userInitAnimationStyle = {  transform: [{translateX: userInitAnimationValue}] };
  const userOpacityAnimatedValue   = useRef(new Animated.Value(0)).current;
  const userOpacityAnimatedStyle   = { opacity : userOpacityAnimatedValue };

  /*Timers*/
  let ch_timer = null;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(userInitAnimationValue, { toValue: 64, duration: 1250, useNativeDriver: true }),
      Animated.timing(userOpacityAnimatedValue, { toValue: 1, duration: 1250, useNativeDriver: true })
    ]).start(()=>{
      ch_timer = setInterval(() => {
        const page = userAnimationImage;
        setUserAnimationImage((prev) => {
          return (prev==="0") ? "1" : "0"
        })
      }, 500);
    });

    return () => {
      clearInterval(ch_timer);
    };
  }, []);

  return (
    <View style={battle.container}>
      <Animated.View style={[{zIndex: 4, position: 'absolute', bottom: 24, width: 64, height: 64},userInitAnimationStyle, userOpacityAnimatedStyle]}>
        <ImageBackground source={(userAnimationImage==="0") ? ch_assets.moving_0 : ch_assets.moving_1} style={{flex: 1}} resizeMode="contain">
        </ImageBackground>
      </Animated.View>

      <View style={{flex:1}}>
        <ImageBackground source={bg_assets.top} style={{
          flex: 1, position:'absolute', width:'100%', height:6, top:0, zIndex:3
        }} resizeMode="repeat">
        </ImageBackground>

        <ImageBackground source={bg_assets.cloud} style={{
          flex: 1, position:'absolute', width:'100%', height:'100%', zIndex: 1
        }}>
        </ImageBackground>

        <ImageBackground source={bg_assets.sky} style={{
          flex: 1, position:'absolute', width:'100%', height:'100%', zIndex: 2
        }}>
        </ImageBackground>

        <View style={{height: 32, position: 'absolute', width: '100%', bottom:0, zIndex: 3}}>
          <ImageBackground source={bg_assets.bottom} style={{ flex: 1}}>
          </ImageBackground>
        </View>
      </View>
    </View>
  )
}

const Status = (props) => {
  const [pressInCancel, setPressInCancel] = useState(false);
  const [pressInDecide, setPressInDecide] = useState(false);

  const decidedPiece = () => {
    if (props.boardConsider) {
      props.decidedPiece();
    }
  }

  const cancelPiece = () => {
    if (props.boardConsider) {
      props.cancelPiece();
    }
  }

  return (
    <View style={status.container}>
      <StatusBar
        user={props.user}
        status={props.status}
      />
    </View>
  )
}

const StatusBar = (props) => {
  const attack = props.status.attack;
  const defend = props.status.defend;
  const recover= props.status.recover;
  const gold   = props.status.gold;
  const user   = props.user;

  const style = StyleSheet.create({
    container : {
      flexDirection: 'row'
    },
    wrap : {
      flexDirection: 'row',
      marginRight: 14
    },
    icon : {
      width: 24,
      height: 24
    },
    textarea : {
      justifyContent: 'center'
    },
    font : {
      fontFamily: 'Dungeon',
      marginLeft: 6,
      marginRight: 4,
      fontWeight: 'bold',
      fontSize: 22,
      letterSpacing: 2,
      color: "#141414"
    }
  });

  return (
    <View style={style.container}>
      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground source={status_assets.heart} style={{ flex: 1 }}>
          </ImageBackground>
        </View>

        <View style={style.textarea}>
          <Text style={style.font}>{user.now_hp}/{user.max_hp}</Text>
        </View>
      </View>

      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground source={status_assets.attack} style={{ flex: 1 }}>
          </ImageBackground>
        </View>

        <View style={style.textarea}>
          <Text style={style.font}>{attack}</Text>
        </View>
      </View>

      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground source={status_assets.defend} style={{ flex: 1 }}>
          </ImageBackground>
        </View>

        <View style={style.textarea}>
          <Text style={style.font}>{defend}</Text>
        </View>
      </View>

      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground source={status_assets.recover} style={{ flex: 1 }}>
          </ImageBackground>
        </View>

        <View style={style.textarea}>
          <Text style={style.font}>{recover}</Text>
        </View>
      </View>

      <View style={style.wrap}>
        <View style={style.icon}>
          <ImageBackground source={status_assets.gold} style={{ flex: 1 }}>
          </ImageBackground>
        </View>

        <View style={style.textarea}>
          <Text style={style.font}>{gold}</Text>
        </View>
      </View>
    </View>
  )
}

const Health = (props) => {
  const user = props.user;

  return (
    <View style={{flex: 1, borderWidth: 1}}>
      <Text>체력 {user.now_hp} / {user.max_hp}</Text>
    </View>
  )
}

const ConsiderButtons = (props) => {
  return (
    <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
      <View style={{width: 56, height: 56, marginRight: 8}}>
        <ImageBackground source={(props.boardConsider && !props.pressInCancel) ? button_assets.cancel_available : button_assets.cancel_disable} style={{ flex: 1 }}>
          <TouchableOpacity onPress={props.cancelPiece} onPressIn={()=>{props.setPressInCancel(true)}} onPressOut={()=>{props.setPressInCancel(false)}} style={{flex:1}}>
          </TouchableOpacity>
        </ImageBackground>
      </View>

      <View style={{ width: 56, height: 56}}>
        <ImageBackground source={(props.boardConsider && !props.pressInDecide) ? button_assets.decide_available : button_assets.decide_disable} style={{ flex: 1 }}>
          <TouchableOpacity onPress={props.decidedPiece} onPressIn={()=>{props.setPressInDecide(true)}} onPressOut={()=>{props.setPressInDecide(false)}} style={{flex:1}}>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </View>
  )
}

const style = StyleSheet.create({
  container : {
    flex:1,
  },
});

const piece = StyleSheet.create({
  piece : {
    width: boardSizeDatas.elementWidth*2 +2,
    height: boardSizeDatas.elementWidth*2 +2,
    flexDirection:'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  next_piece : {
    width: boardSizeDatas.elementWidth*2 +2,
    height: boardSizeDatas.elementWidth*2 +2,
    flexDirection:'row',
    flexWrap: 'wrap',
    marginRight:27,
    justifyContent: 'center',
    alignItems: 'center',
    dynamicOpacity : (type) => {
      const opacity = (type === 'next') ? '0.7' : (type === 'after') ? '0.4' : (type === 'last') ? '0.1' : '0';
      return {
        opacity: opacity
      }
    }
  },
  el : {
    width : boardSizeDatas.elementWidth,
    height: boardSizeDatas.elementWidth,
  },
  frame : {
    position: 'absolute',
    width : boardSizeDatas.elementWidth*2 + 2 + 14,
    height: boardSizeDatas.elementWidth*2 + 2 + 14,
    right: 41, //controller.container.paddingRight - 위에 절반
  },
  controller : {
    whole : {
      height:(boardSizeDatas.elementWidth*3) + (boardSizeDatas.elementWidth/1.5),
      width:'100%',
      flexDirection:'row',
      paddingBottom:boardSizeDatas.elementWidth/1.5,
    },
    container : {
      flexDirection:'row',
      flex:1,
      alignItems:'center',
      justifyContent:'flex-end',
      flexWrap: 'nowrap',
      paddingRight: 48,
    }
  }
})

const header = StyleSheet.create({
  container: {
    height:headerHeight,
  },
  wrap:{
    flex:1,
    justifyContent:'flex-start',
    alignItems:'flex-end',
    flexDirection: 'row',
    paddingLeft: 24,
    paddingRight: 24,
    paddingBottom: 6
  },
  phase : {
    flexDirection: 'row',
    marginRight: 18,
    alignItems: 'center'
  },
  score : {
    flexDirection: 'row',
    alignItems: 'center'
  },
  setting : {
    marginLeft: 'auto'
  },
  label : {
    fontSize: 28,
    fontFamily: 'Dungeon',
    color: '#141414'
  },
  value : {
    fontSize: 28,
    fontFamily: 'Dungeon',
    marginLeft: 6,
    width: 34,
    color: '#141414'
  }
})

const board = StyleSheet.create({
  container : {},
  main : {
    width: boardSizeDatas.boardWidth,
    height: boardSizeDatas.boardHeight+14,
    flexDirection:'row',
    flexWrap:'wrap',
    alignSelf : 'center',
    paddingBottom: 14
  }
});

const status = StyleSheet.create({
  container : {
    paddingLeft:16,
    paddingRight:16,
    paddingTop: boardSizeDatas.elementWidth/1.5,
    paddingBottom: 4,
  },
  status : {
    borderWidth: 1,
    flex:1
  },
  decided : {
    borderWidth :1,
    justifyContent:'center'
  },
  userstats : {
    flex:1
  }
});

const battle = StyleSheet.create({
  container : {
    flex:1,
  }
});

export default Game;
