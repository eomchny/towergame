import React, { Component, useRef, useState, useEffect } from 'react';
import { StyleSheet, Animated, Text, View, Button, TextInput, SafeAreaView, ScrollView, TouchableOpacity, Image, ImageBackground, Alert, Dimensions } from 'react-native';
import { PanResponder } from 'react-native';
import pieceApi from '../../apis/pieceApi';

const boardSize = 10;
const screenWidth = Dimensions.get('window').width;
const boardWidth = (screenWidth-34%2 !== 0) ? screenWidth-35 : screenWidth-34;
const headerHeight = 140;
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
  back    : require('../../imgs/icons/background.png')
};

const button_assets = {
  left       : require('../../imgs/buttons/left_button.png'),
  right      : require('../../imgs/buttons/right_button.png'),
  horizontal : require('../../imgs/buttons/horizontal_button.png'),
  vertical   : require('../../imgs/buttons/vertical_button.png'),
  /**/
  decide_available : require('../../imgs/buttons/decide_available.png'),
  decide_disable   : require('../../imgs/buttons/decide_disable.png'),
  cancel_available : require('../../imgs/buttons/cancel_available.png'),
  cancel_disable   : require('../../imgs/buttons/cancel_disable.png'),
}

const status_assets = {
  attack  : require('../../imgs/icons/status/attack.png'),
  defend  : require('../../imgs/icons/status/defend.png'),
  recover : require('../../imgs/icons/status/recover.png'),
  gold    : require('../../imgs/icons/status/gold.png'),
  heart   : require('../../imgs/icons/status/heart.png')
}

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
      floor : 1
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
          <Header
            floor={this.state.floor}
            battle={this.state.battle}
          />

          <Board
            user={this.state.user}
            status={this.state.status}
            upFloor={this.upFloor}
            battle={this.state.battle}
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
          <Text>층수 : {this.props.floor}</Text>
          <Text>Battle : {this.props.battle.toString()}</Text>
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

    this.setState({
      board    : origin_board,
      consider : true,
      consider_element_tr : [releasedRow, releasedCol]
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
        <View
          style = {board.main}
          ref = {this.boardRef}
          onLayout = {this.componentMeasure}
        >
          {this.getTiles()}
        </View>

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
      </View>
    )
  }
}

const Tile = (props) => {
  const data = props.data;
  const row = props.row;
  const col = props.col;

  if (data === null) {
    return (
      <View style={[{
        borderWidth: 1,
        width:boardSizeDatas.elementWidth,
        height:boardSizeDatas.elementWidth,
        opacity: '1'
      }, piece.temp(data?.name)]}
      >
        <Text>
          {row+"-"+col}
        </Text>
      </View>
    )
  } else {
    const source = element_assets[data.name];

    return (
      <View style={{
        borderWidth: 1,
        width:boardSizeDatas.elementWidth,
        height:boardSizeDatas.elementWidth,
        opacity: (data.decided) ? '1' : '0.5'
      }}
      >
        <ImageBackground source={source} style={{ flex: 1, justifyContent:'center'}}>
          <Text style={piece.el.font}>
            {data.code}
          </Text>
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
        </View>

      <View style={{width:boardSizeDatas.elementWidth*3, flexDirection:'row', flexWrap:'wrap'}}>
        <View style={{height:'50%', width:'50%'}}>
          <ImageBackground source={button_assets.left} style={{ flex: 1, justifyContent:'center'}}>
            <TouchableOpacity onPress={pieceRotateLeft} style={{flex:1}}>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View style={{height:'50%', width:'50%'}}>
          <ImageBackground source={button_assets.right} style={{ flex: 1, justifyContent:'center'}}>
            <TouchableOpacity onPress={pieceRotateRight} style={{flex:1}}>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View style={{height:'50%', width:'50%'}}>
          <ImageBackground source={button_assets.vertical} style={{ flex: 1, justifyContent:'center'}}>
            <TouchableOpacity onPress={pieceRotateVertical} style={{flex:1}}>
            </TouchableOpacity>
          </ImageBackground>
        </View>

        <View style={{height:'50%', width:'50%'}}>
          <ImageBackground source={button_assets.horizontal} style={{ flex: 1, justifyContent:'center'}}>
            <TouchableOpacity onPress={pieceRotateHorizontal} style={{flex:1}}>
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
        duration: 500,
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
    return Animated.timing(opacityAnimatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
    });
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
      }, (props.boardConsider) ? {opacity:'0.7'} : opacityAnimatedStyle]}
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
        <ImageBackground source={source} style={{ flex: 1, justifyContent:'center'}}>
          <Text style={piece.el.font}>
          {data.code}
          </Text>
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
  const bg_assets = {
    top     : require('../../imgs/backgrounds/battle_top.png'),
    center  : require('../../imgs/backgrounds/battle_center.png'),
    bottom  : require('../../imgs/backgrounds/battle_bottom.png'),
  }

  return (
    <View style={battle.container}>
      <View style={{height: 28, position: 'absolute', width: '100%', top:0, zIndex: 1}}>
        <ImageBackground source={bg_assets.top} style={{ flex: 1}}>
        </ImageBackground>
      </View>

      <View style={{flex: 1}}>
        <ImageBackground source={bg_assets.center} style={{ flex: 1}}>
        </ImageBackground>
      </View>

      <View style={{height: 32, position: 'absolute', width: '100%', bottom:0}}>
        <ImageBackground source={bg_assets.bottom} style={{ flex: 1}}>
        </ImageBackground>
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

      <View style={{flexDirection: 'row'}}>
        <Health user={props.user}/>

        <ConsiderButtons
          pressInCancel     ={pressInCancel}
          setPressInCancel  ={setPressInCancel}
          pressInDecide     ={pressInDecide}
          setPressInDecide  ={setPressInDecide}
          boardConsider     ={props.boardConsider}
          decidedPiece      ={decidedPiece}
          cancelPiece       ={cancelPiece}
        />
      </View>
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
      fontFamily: 'Ancient',
      marginLeft: 6,
      marginRight: 4,
      fontWeight: 'bold',
      fontSize: 20,
      letterSpacing: 2,
      paddingTop: 2
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
    borderWidth: 1
  },
});

const piece = StyleSheet.create({
  piece : {
    width: boardSizeDatas.elementWidth*2 +5,
    height: boardSizeDatas.elementWidth*2 +5,
    flexDirection:'row',
    flexWrap: 'wrap',
    borderRadius:5,
    overflow:'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight:24,
  },
  next_piece : {
    width: boardSizeDatas.elementWidth*2 +5,
    height: boardSizeDatas.elementWidth*2 +5,
    flexDirection:'row',
    flexWrap: 'wrap',
    marginRight:24,
    borderRadius:5,
    overflow:'hidden',
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

    font : {
      color:'white',
      fontWeight: 'bold',
      fontSize : 16,
      fontFamily : 'Ancient',
      textAlign:'center',
      paddingRight:2
    }
  },
  temp : (name) => {
    let backgroundColor;
    if (name === 'attack') {
      backgroundColor = 'red'
    } else if (name === 'gold') {
      backgroundColor = 'yellow'
    } else if (name === 'defend') {
      backgroundColor = 'blue'
    } else if (name === 'recover') {
      backgroundColor = 'green'
    } else {
      backgroundColor = 'white'
    }

    return {
      backgroundColor : backgroundColor
    }
  },
  controller : {
    whole : {
      height:boardSizeDatas.elementWidth*3,
      width:'100%',
      flexDirection:'row',
      paddingRight:8
    },
    container : {
      flexDirection:'row',
      flex:1,
      alignItems:'center',
      justifyContent:'flex-end',
      flexWrap: 'nowrap'
    }
  }
})

const header = StyleSheet.create({
  container: {
    backgroundColor:'white',
    height:headerHeight,
  },
  wrap:{
    borderWidth:1,
    borderColor:'green',
    flex:1,
    justifyContent:'flex-end',
    alignItems:'center',
    paddingBottom:16
  }
})

const board = StyleSheet.create({
  container : {
    borderWidth: 1,
  },
  main : {
    width: boardSizeDatas.boardWidth,
    height: boardSizeDatas.boardHeight,
    flexDirection:'row',
    flexWrap:'wrap',
    alignSelf : 'center'
  }
});

const status = StyleSheet.create({
  container : {
    borderWidth: 1,
    paddingLeft:8,
    paddingRight:8,
    paddingTop:4,
    paddingBottom:4
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
    borderWidth: 1,
    flex:1
  }
});

const battle = StyleSheet.create({
  container : {
    flex:1
  }
});

export default Game;
