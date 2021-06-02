import React from "react";
import { CircularProgress, makeStyles } from "@material-ui/core";
import ReactModal from "react-modal";

const useStyles = makeStyles((theme) => ({
  root: {},
}));

function LoadingBar({ isOpen, ...rest }) {
  const classes = useStyles();

  return (
    <ReactModal
      isOpen={isOpen}
      ariaHideApp={false}
      style={{
        content: {
          left: "50%",
          top: "50%",
          right: "auto",
          bottom: "auto",
          marginRight: "-50%",
          transform: "translate(-50%, -50%)",
          borderWidth: 0,
        },
      }}
    >
      <CircularProgress color="secondary" />
    </ReactModal>
  );
}

export default LoadingBar;
