import { Text, Container, Flex, Box, Button, TextInput, Modal } from '@mantine/core';
import { useState } from 'react';

const VerifiyTransaction = () => {
    const [opened, setOpened] = useState(false);

    const showModal = () => {
        setOpened(!opened)
    }
  return (
    <Container size="md">
      <Text fw="bold" fz="xl" mb="md">Verify MBOK Transaction</Text>
      <Box sx={{width: 400}}>
        <TextInput placeholder='enter transaction ID' mb={5} />
        <TextInput placeholder='enter amount' mb={8} />
        <Button onClick={() => showModal()}>Check</Button>
      </Box>
      <Modal >
        <Modal.Body>
            <Text>Transaction is successful!</Text>
        </Modal.Body>
        </Modal>
    </Container>
  );
};

export default VerifiyTransaction;