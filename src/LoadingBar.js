import React from "react";
import { CircularProgress } from "@material-ui/core";
import ReactModal from "react-modal";

function LoadingBar({ isOpen, ...rest }) {
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
