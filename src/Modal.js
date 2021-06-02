import React, { useEffect, useState } from "react";
import { Dialog, makeStyles } from "@material-ui/core";
import DaumPostcode from "react-daum-postcode";

const useStyles = makeStyles((theme) => ({
  popup: {},
}));

function Modal(props) {
  const classes = useStyles();
  // const [isOpen, setOpen] = useState(props.isOpen);
  // useEffect(() => {
  //   setOpen(props.isOpen);
  // }, []);
  const handleAddressComplete = (data) => {
    // console.log("data ==========", data);

    props.handleAddressComplete({
      address: data.address,
      zonecode: data.zonecode,
    });
  };
  const handleClose = () => {
    console.log("handleClose");
    // setOpen(false);
    props.close();
  };
  return (
    <Dialog
      className={classes.popup}
      open={props.isOpen}
      onClose={handleClose}
      fullWidth
    >
      <DaumPostcode onComplete={handleAddressComplete} />
    </Dialog>
  );
}

export default Modal;
