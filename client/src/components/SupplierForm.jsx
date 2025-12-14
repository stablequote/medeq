import React, { useState } from 'react';
import { TextInput, Group, Button, Modal, Select, Flex } from '@mantine/core';
import { useTranslation } from 'react-i18next';

const SupplierForm = ({ opened, setOpened, handleAddSupplier }) => {
  const [newSupplier, setNewSupplier] = useState({
    supplierName: '',
    supplierID: '',
    contact: '',
    address: '',
    email: '',
    phoneNumber: '',
  });

  const { t } = useTranslation();

  const handleSubmit = () => {
    handleAddSupplier(newSupplier); 
    setOpened(false); // Close the modal after adding
  };

  return (
    <Modal opened={opened} onClose={() => setOpened(false)} title={t("ADD-NEW-SUPPLIER")}>
      <TextInput
        label={t("SUPPLIER-NAME")}
        value={newSupplier.supplierName}
        onChange={(e) => setNewSupplier({ ...newSupplier, supplierName: e.target.value })}
        required
      />
      <TextInput
        label={t("Supplier-ID")}
        value={newSupplier.supplierID}
        onChange={(e) => setNewSupplier({ ...newSupplier, supplierID: e.target.value })}
        required
      />
      <TextInput
        label={t("CONTACT-NUMBER")}
        value={newSupplier.contact}
        onChange={(e) => setNewSupplier({ ...newSupplier, contact: e.target.value })}
        required
      />
      <TextInput
        label={t("ADDRESS")}
        value={newSupplier.address}
        onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
        required
      />
      <TextInput
        label={t("EMAIL")}
        type="email"
        value={newSupplier.email}
        onChange={(e) => setNewSupplier({ ...newSupplier, email: e.target.value })}
        required
      />
      {/* <TextInput
        label={t("PHONE-NUMBER")}
        value={newSupplier.phoneNumber}
        onChange={(e) => setNewSupplier({ ...newSupplier, phoneNumber: e.target.value })}
        required
      /> */}
      <Flex justify="space-between" mt="md">
        <Button variant="light" onClick={() => setOpened(false)}>
          {t("CANCEL")}
        </Button>
        <Button onClick={handleSubmit}>{t("ADD-SUPPLIER")}</Button>
      </Flex>
    </Modal>
  );
};

export default SupplierForm;