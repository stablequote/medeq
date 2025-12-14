import React, { useState } from "react";
import {
  Container,
  Grid,
  Group,
  Text,
  Divider,
  Button,
  NumberInput,
  Select,
  Paper,
} from "@mantine/core";

const initialCart = [
  { id: 1, name: "Antiva 50ml", quantity: 12, price: 350 },
  { id: 2, name: "Ketoporfen 30gm", quantity: 5, price: 350 },
  { id: 3, name: "Tramadol 50mg", quantity: 4, price: 32 },
];

const CheckoutCart = () => {
  const [cart, setCart] = useState(initialCart);
  const [payment, setPayment] = useState({
    netTotal: 0,
    discount: 0,
    previous: 0,
    paidAmount: 0,
    dueAmount: 0,
    paymentType: "Cash",
  });

  const updateQuantity = (id, action) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: action === "increment" ? item.quantity + 1 : item.quantity - 1,
            }
          : item
      ).filter((item) => item.quantity > 0)
    );
  };

  const calculateNetTotal = () => {
    return cart.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  return (
    <Container size="sm">
      {/* Overview Section */}
      <Paper shadow="xs" p="md" mb="md" radius="lg">
        <Group position="apart">
          <Text weight={500} size="lg">
            Overview
          </Text>
          <Text size="sm" color="dimmed">
            {new Date().toLocaleString()}
          </Text>
        </Group>
        <Divider my="sm" />

        <Grid>
          <Grid.Col span={6}>
            <Text weight={500} size="sm">
              Medicine Name
            </Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <Text weight={500} size="sm">
              Quantity
            </Text>
          </Grid.Col>
          <Grid.Col span={3}>
            <Text weight={500} size="sm">
              Total Price
            </Text>
          </Grid.Col>
        </Grid>
        {cart.map((item) => (
          <Group key={item.id} spacing="sm" mb="sm" align="center">
            <Grid grow>
              <Grid.Col span={6}>
                <Text>{item.name}</Text>
              </Grid.Col>
              <Grid.Col span={3}>
                <Group spacing="xs">
                  <Button
                    compact
                    size="xs"
                    onClick={() => updateQuantity(item.id, "increment")}
                  >
                    +
                  </Button>
                  <NumberInput
                    value={item.quantity}
                    size="xs"
                    readOnly
                    hideControls
                    style={{ width: "50px" }}
                  />
                  <Button
                    compact
                    size="xs"
                    onClick={() => updateQuantity(item.id, "decrement")}
                  >
                    -
                  </Button>
                </Group>
              </Grid.Col>
              <Grid.Col span={3}>
                <Text>${(item.quantity * item.price).toFixed(2)}</Text>
              </Grid.Col>
            </Grid>
          </Group>
        ))}
      </Paper>

      {/* Payment Section */}
      <Paper shadow="xs" p="md" radius="lg">
        <Text weight={500} size="lg" mb="sm">
          Payment
        </Text>
        <Divider my="sm" />

        <Group position="apart" mb="xs">
          <Text>Net Total</Text>
          <Text>${calculateNetTotal().toFixed(2)}</Text>
        </Group>
        <Group position="apart" mb="xs">
          <Text>Discount</Text>
          <Text>{payment.discount.toFixed(2)}</Text>
        </Group>
        <Group position="apart" mb="xs">
          <Text>Previous:</Text>
          <Text>{payment.previous.toFixed(2)}</Text>
        </Group>
        <Group position="apart" mb="xs">
          <Text>Paid Amount</Text>
          <Text>{payment.paidAmount.toFixed(2)}</Text>
        </Group>
        <Group position="apart" mb="xs">
          <Text>Due Amount</Text>
          <Text>{payment.dueAmount.toFixed(2)}</Text>
        </Group>

        <Select
          label="Payment Type"
          value={payment.paymentType}
          onChange={(value) =>
            setPayment((prev) => ({ ...prev, paymentType: value }))
          }
          data={["Cash", "Card", "Online"]}
          mb="md"
        />
        <Group position="apart">
          <Button variant="light" color="gray">
            Reset
          </Button>
          <Button color="green">Save</Button>
        </Group>
      </Paper>
    </Container>
  );
};

export default CheckoutCart;