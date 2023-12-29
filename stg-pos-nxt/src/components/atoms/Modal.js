import { Modal } from "flowbite-react";

export default function ModalTemplate({
  display,
  setDisplay,
  children,
  title,
}) {
  return (
    <Modal show={display} onClose={() => setDisplay(false)}>
      <Modal.Header>{title}</Modal.Header>
      <Modal.Body>{children}</Modal.Body>
    </Modal>
  );
}
