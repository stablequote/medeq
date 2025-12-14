import { useEffect, useState } from 'react';
import { Button, Container, Flex, Grid, Modal } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SupplierCard from './SupplierCard';
import { IconAccessible, IconArrowLeft } from '@tabler/icons-react';
import { t } from 'i18next';
import SupplierForm from './SupplierForm';

const SuppliersList = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [opened, setOpened] = useState(false);
  const [suppliersData, setSuppliersData] = useState([]);

  const navigate = useNavigate();
  const BASE_URL = import.meta.env.VITE_URL;

  useEffect(() => {
    axios.get(`${BASE_URL}/supplier/list`)
      .then((res) => setSuppliers(res.data.supplier))
      .catch((err) => console.error(err));
  }, []);

  const handleAddSupplier = (newSupplier) => {
    setSuppliersData((prevData) => [
      ...prevData,
      { ...newSupplier },
    ]);
  };

  return (
    <Container size="100%">
      <Flex mb="xs" justify="space-between">
        {/* <Button variant="outline" color="blue" leftIcon={<IconArrowLeft />} onClick={() => returnBack()} >{t("RETURN")}</Button> */}
        <Button variant='filled' color="green" leftIcon={<IconAccessible />} onClick={() => setOpened(!opened)}>{t("ADD-SUPPLIER")}</Button>
      </Flex>
      <Grid>
        {suppliers.map((supplier) => (
          <Grid.Col span={4} key={supplier._id}>
            <SupplierCard supplier={supplier} />
          </Grid.Col>
        ))}
      </Grid>
      <SupplierForm opened={opened} setOpened={setOpened} handleAddSupplier={handleAddSupplier} />
    </Container>
  );
};

export default SuppliersList;
