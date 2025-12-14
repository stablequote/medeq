import { Button, Card, Text } from '@mantine/core'
import React from 'react'
import { useNavigate } from 'react-router-dom'


function SupplierCard({ supplier }) {
  const navigate = useNavigate();

  const handleSupplierClick = (supplierId) => {
    navigate(`/supplier/orders?supplierId=${supplierId}`);
  };

  return (
    <Card shadow="sm" padding="lg" onClick={() => handleSupplierClick(supplier._id)} sx={{cursor: "pointer", borderRadius: 20, height: 100, display: "flex", justifyContent: "center", alignItems: "center"}}>
        <Text weight={500} color="blue">{supplier.name}</Text>
        {/* <Button
            fullWidth mt="md"
            onClick={() => handleSupplierClick(supplier._id)}
        >
            View Orders
        </Button> */}
    </Card>
  )
}

export default SupplierCard