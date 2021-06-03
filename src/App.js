import "./App.css";
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import queryString from "query-string";
import LoadingBar from "./LoadingBar";
import Modal from "./Modal";
import {
  Box,
  Button,
  FormLabel,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  Divider,
  TextField,
  Typography,
  makeStyles,
  AppBar,
  Toolbar,
} from "@material-ui/core";

const Target =
  "http://gift-message-order-exaxdx2.s3-website.ap-northeast-2.amazonaws.com";
const GMP_NAME = "GMP-Order";
const GMP_API = "https://api.gift-message.com";
const USER_TYPE = {
  FULFILLMENT: "fulfillment",
  ORDERING: "ordering",
};

/// 가맹점 및 주문 받을 계정
const ful_username = "flower2";

/// 미스봉 계정
const ORDER_HANDLER = "missBong";
const PASSWORD_order = "1111";

const useStyles = makeStyles((theme) => ({
  title: {
    textAlign: "center",
  },
  appbar: {
    alignItems: "center",
  },
  messageChoice: {
    marginTop: theme.spacing(6),
  },
  messageTitle: {
    marginBottom: theme.spacing(2),
  },
  box: {
    borderRadius: theme.spacing(1.5),
    paddingTop: theme.spacing(2),
    width: theme.spacing(12),
    height: theme.spacing(12),
    borderWidth: 1,
    border: "1px solid rgb(200, 200, 200)",
  },
  payment: {
    justifyContent: "flex-end",
    display: "flex",
    marginRight: theme.spacing(4),
  },
  address1: {
    marginTop: theme.spacing(1),
    width: theme.spacing(54),
  },
  add2Box: {
    marginTop: theme.spacing(1),
    justifyContent: "center",
  },
  address2: {
    width: theme.spacing(41),
    marginRight: theme.spacing(1),
  },
  post: {
    width: theme.spacing(12),
  },
}));

function App() {
  // const [orderId, setOrderId] = useState();
  const orderId = useRef();
  // let timer;
  const [query, setQuery] = useState();
  const [loading, setLoading] = useState(false);
  const [radioValue, setRadioValue] = useState("none");
  const classes = useStyles();
  const [addressModal, setModal] = useState(false);
  const [message, setMessage] = useState({
    senderName: "강찬",
    senderPhone: "123123123",
    receiverName: "희선",
    receiverPhone: "123123123",
    giftName: "꽃바구니 1호",
    receiverAddress1: "경기도 성남시 수정구 창업로 42",
    receiverAddress2: "판교 제2테크노밸리 경기기업성장센터 416호",
    receiverZip: "13449",
  });
  let popup;

  useEffect(() => {
    // createUser();
    window.addEventListener(
      "message",
      (event) => {
        console.log("parent receiveMessage event = ", event);
        if (event?.data === "close_order_page") {
          // possible some data
        }
      },
      false
    );

    const timer = setInterval(() => {
      if (popup?.closed) {
        clearInterval(timer);
        getPreorder();
      }
    }, 500);
    return () => {
      clearInterval(timer);
    };
  }, []);

  const loadOrderPage = async () => {
    const preorderId = await getPreorderId();
    orderId.current = preorderId;
    // console.log("orderid ", orderId, ", preorderId ", preorderId);
    if (preorderId) {
      await openOrderPage(preorderId);
    }
  };

  const openOrderPage = async (preorderId) => {
    /**
     * query params
     *
     * orderId : ORDER HANDLER
     * receiverName
     * receiverPhone
     * senderName
     * senderPhone
     * giftName
     * receiverAddress1
     * receiverAddress2
     * receiverZip
     */
    const params = `?orderId=${preorderId}&receiverName=${message.receiverName}&receiverPhone=${message.receiverPhone}&senderName=${message.senderName}&senderPhone=${message.senderPhone}&giftName=${message.giftName}&receiverAddress1=${message.receiverAddress1}&receiverAddress2=${message.receiverAddress2}&receiverZip=${message.receiverZip}`;

    const url = Target + params;

    // const { search } = window.location; // 문자열 형식으로 결과값이 반환된다.
    const queryObj = queryString.parse(params); // 문자열의 쿼리스트링을 Object로 변환

    console.log("[App] queryObj = ", queryObj);
    setQuery(queryObj);

    console.log("[App] open window url = ", url);
    popup = window.open(url, GMP_NAME, "width=500,height=800");
  };

  function errorMessage(msg) {
    alert(msg);
  }

  const getPreorder = async () => {
    if (orderId.current === undefined) {
      alert("orderId missing");
      return;
    }
    setLoading(true);
    const url = GMP_API + "/get-preorder";
    const params = {
      orderId: orderId.current,
      requestPreview: false,
    };
    try {
      console.log("[App] getPreorder / orderId = ", orderId.current);
      const result = await axios.post(url, params);
      setLoading(false);
      console.log("[App] getPreorder / result = ", result);
      if (result && result.data && result.data.result === "OK") {
        console.log("ok");

        return;
      } else {
        setRadioValue("none");
        errorMessage("마이심 카드 주문을 취소하였습니다");
      }
    } catch (e) {
      setLoading(false);
      errorMessage("주문이 잘못되었습니다.");
      console.error(e);
    }
  };
  const submitOrder = async () => {
    /// first authenticate
    setLoading(true);
    const data = await authenticate();
    if (data) {
      const url = GMP_API + "/submit-order";
      const params = {
        orderId: orderId.current,
        orderDetail: {
          giftName: query.giftName,
          senderName: query.senderName,
          receiverName: query.receiverName,
          receiverAddress1: query.receiverAddress1,
          receiverAddress2: query.receiverAddress2,
          receiverZip: query.receiverZip,
        },
        fulfillmentHandler: ful_username,
      };
      const config = {
        headers: {
          Authorization: `Bearer ${data.token}`,
        },
      };
      console.log("config = ", config);
      console.log("params = ", params);
      try {
        const result = await axios.post(url, params, config);
        console.log("[submitOrder] result = ", result);
        setLoading(false);
        if (result && result.data && result.data.result === "OK") {
          errorMessage("결제에 성공하였습니다");
        } else {
          errorMessage(result?.data?.result || "결제에 실패했습니다");
        }
      } catch (e) {
        errorMessage("서버 통신에 문제가 있습니다");
        console.error(e);
      }
    }
  };

  const authenticate = async () => {
    const url = GMP_API + "/authenticate";
    const params = {
      userName: ORDER_HANDLER,
      password: PASSWORD_order,
      userType: USER_TYPE.ORDERING,
    };
    const result = await axios.post(url, params);
    console.log("authenticate / result = ", result);
    if (result && result.data && result.data.authResult) {
      const { token, tokenExpire } = result.data.authResult;
      return { token, tokenExpire };
    }
    return undefined;
  };

  const createUser = async () => {
    const result = await axios.post(GMP_API + "/create-user", {
      userName: ORDER_HANDLER,
      userType: USER_TYPE.ORDERING,
      password: PASSWORD_order,
    });
    console.log("createUser / result = ", result);
  };

  const getPreorderId = async () => {
    setLoading(true);
    try {
      const res = await axios.post(GMP_API + "/prepare-order", {
        orderingHandler: ORDER_HANDLER,
      });
      console.log("[App] getPreorderld / res.data = ", res.data);
      if (res && res.data && res.data.result === "OK") {
        const preorderId = res.data.orderId;
        setLoading(false);
        return preorderId;
      }
      setLoading(false);
    } catch (e) {
      setLoading(false);
      console.error(e);
    }
    return undefined;
  };

  const handleChange = (e) => {
    setRadioValue(e.target.value);
    if (e.target.value === "mysim") {
      loadOrderPage();
    }
  };

  const onFocusClick = (e) => {
    document.activeElement.blur();
    setModal(true);
  };
  const onChange = (type, value) => {
    var msg = {
      ...message,
    };
    msg[`${type}`] = value;
    setMessage(msg);
  };
  const handleAddressComplete = (data) => {
    setMessage({
      ...message,
      receiverAddress1: data.address,
      receiverAddress2: "",
      receiverZip: data.zonecode,
    });
    setModal(false);
  };
  return (
    <div className="App">
      <AppBar position="static" color="default" className={classes.appbar}>
        <Toolbar>
          <Typography variant="h6" className={classes.title}>
            주문 화면
          </Typography>
        </Toolbar>
      </AppBar>
      <Divider />

      <Box>
        <Typography
          color="textSecondary"
          style={{ marginTop: 20, marginBottom: 15 }}
          gutterBottom
          variant="h6"
        >
          보내는 사람
        </Typography>

        <Box display="flex" flexDirection="row" justifyContent="center">
          <TextField
            style={{ margin: 5 }}
            label="이름"
            variant="outlined"
            value={message?.senderName}
            onChange={(e) => {
              onChange("senderName", e.target.value);
            }}
          />
          <Box m={2} />
          <TextField
            style={{ margin: 5 }}
            label="전화번호"
            variant="outlined"
            value={message?.senderPhone}
            onChange={(e) => {
              onChange("senderPhone", e.target.value);
            }}
          />
        </Box>

        <Typography
          style={{ marginTop: 20, marginBottom: 15 }}
          color="textSecondary"
          gutterBottom
          variant="h6"
        >
          받는 사람
        </Typography>

        <Box display="flex" flexDirection="row" justifyContent="center">
          <TextField
            style={{ margin: 5 }}
            label="이름"
            variant="outlined"
            value={message?.receiverName}
            onChange={(e) => {
              onChange("receiverName", e.target.value);
            }}
          />
          <Box m={2} />
          <TextField
            style={{ margin: 5 }}
            label="전화번호"
            variant="outlined"
            value={message?.receiverPhone}
            onChange={(e) => {
              onChange("receiverPhone", e.target.value);
            }}
          />
        </Box>

        <TextField
          // style={{ marginTop: 12, flex: 1 , paddingLeft: t}}
          className={classes.address1}
          label="주소"
          variant="outlined"
          value={message?.receiverAddress1}
          onClick={(e) => {
            document.activeElement.blur();
            onFocusClick(e.target.value);
          }}
        />
        <Box display="flex" flexDirection="row" className={classes.add2Box}>
          <TextField
            className={classes.address2}
            label="상세주소(아파트 동호수)"
            variant="outlined"
            value={message?.receiverAddress2}
            onChange={(e) => {
              onChange("receiverAddress2", e.target.value);
            }}
          />
          <TextField
            className={classes.post}
            label="우편번호"
            variant="outlined"
            value={message?.receiverZip}
            onClick={(e) => {
              document.activeElement.blur();
              onFocusClick(e.target.value);
            }}
          />
        </Box>
      </Box>
      <FormControl component="fieldset" className={classes.messageChoice}>
        <FormLabel component="legend" className={classes.messageTitle}>
          메세지 방식을 선택하세요
        </FormLabel>

        <RadioGroup
          row
          aria-label="position"
          name="position"
          defaultValue={"none"}
          value={radioValue}
          onChange={handleChange}
        >
          <FormControlLabel
            className={classes.box}
            value="none"
            control={<Radio color="primary" />}
            label="없음"
            labelPlacement="bottom"
          />
          <FormControlLabel
            className={classes.box}
            value="card"
            control={<Radio color="primary" />}
            label="카드"
            labelPlacement="bottom"
          />
          <FormControlLabel
            className={classes.box}
            value="ribbon"
            control={<Radio color="primary" />}
            label="리본"
            labelPlacement="bottom"
          />
          <FormControlLabel
            className={classes.box}
            value="mysim"
            control={<Radio color="primary" />}
            label="마이심 카드"
            labelPlacement="bottom"
          />
        </RadioGroup>
      </FormControl>
      <Box mt={8} mb={4} ml={4} mr={4}>
        <Divider></Divider>
      </Box>
      <Box className={classes.payment}>
        <Button
          color="secondary"
          variant="contained"
          component="span"
          onClick={() => {
            submitOrder();
          }}
        >
          결제
        </Button>
      </Box>
      <LoadingBar isOpen={loading} />
      <Modal
        isOpen={addressModal}
        handleAddressComplete={handleAddressComplete}
        close={() => {
          setModal(false);
        }}
      ></Modal>
    </div>
  );
}

export default App;
