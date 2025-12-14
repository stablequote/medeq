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
  Card,
  Image,
  TextInput,
  Badge,
  ActionIcon,
  Flex,
  Modal
} from "@mantine/core";
import { IconSearch, IconPlus, IconUser, IconShoppingCartPlus } from "@tabler/icons-react";
// Example product data with 15 products
// const products = Array.from({ length: 15 }, (_, index) => ({
//   id: index + 1,
//   name: `Product ${index + 1}`,
//   price: (10 + index * 5).toFixed(2),
//   image: "https://via.placeholder.com/100",
// }));

import {data as products} from '../utils/data'
import medicineImage from '../assets/medicine.jpg'
import BarcodeScanner from "../components/BarcodeScanner";

const Sales = () => {
  const [cart, setCart] = useState([]);
  const [opened, setOpened] = useState(false);

  const addToCart = (product) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, action) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: action === "increment" ? item.quantity + 1 : item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const deleteItem = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const calculateNetTotal = () => {
    return cart.reduce((total, item) => total + item.quantity * item.price, 0);
  };

  return (
    <Container size="xl">
      <Grid>
      <BarcodeScanner />
        {/* Filters and Search Bar */}
        <Grid.Col span={8}>
          <Group spacing="sm" mb="md">
            <Badge variant="filled" color="blue">
              All
            </Badge>
            <Badge variant="outline" color="gray">
              Medicine
            </Badge>
            <Badge variant="outline" color="gray">
              Syrup
            </Badge>
            <Badge variant="outline" color="gray">
              Liquid
            </Badge>
            <Badge variant="outline" color="gray">
              Tablet
            </Badge>
            <Badge variant="outline" color="gray">
              Ointment
            </Badge>
            <Badge variant="outline" color="gray">
              Cream
            </Badge>
          </Group>
          <Group>
            <TextInput
              placeholder="Search Items/code"
              icon={<IconSearch size={16} />}
              style={{ flex: 1 }}
            />
            <TextInput
              placeholder="Walking Customer"
              icon={<IconUser size={16} />}
              style={{ flex: 1 }}
            />
          </Group>
        </Grid.Col>

        {/* Products Grid */}
        <Grid.Col span={8}>
          <Paper shadow="xs" p="md" radius="lg" style={{ overflow: "auto", height: "70vh" }}>
            <Grid columns={15}>
              {products.map((product) => (
                <Grid.Col span={3} key={product.id}>
                  <Card shadow="sm" padding="lg" radius="md">
                    <Card.Section>
                      <Image src={medicineImage} height={100} alt={product.name} />
                    </Card.Section>
                    <Text weight={500} size="sm" mt="sm">
                      {product.product}
                    </Text>
                    <Text color="dimmed" size="sm">
                      ${product.price}
                    </Text>
                    <Group position="center" mt="sm">
                      <ActionIcon
                        color="blue"
                        variant="filled"
                        onClick={() => addToCart(product)}
                      >
                        <IconShoppingCartPlus size={16} />
                      </ActionIcon>
                    </Group>
                  </Card>
                </Grid.Col>
              ))}
            </Grid>
          </Paper>
        </Grid.Col>

        {/* Cart and Payment Section */}
        <Grid.Col span={4}>
          <Paper shadow="xs" p="md" radius="lg">
            <Text weight={500} size="lg">
              Overview
            </Text>
            <Divider my="sm" />
            {cart.map((item) => (
              <Group key={item.id} spacing="sm" mb="sm" align="center">
                <Grid gutter="lg" sx={{width: 400}} >
                  {/* Product Name */}
                  <Grid.Col span={5 }>
                    <Text>{item.product}</Text>
                  </Grid.Col>
                  
                  {/* Increment, Quantity, Decrement (Aligned Horizontally) */}
                  <Grid.Col span={3}>
                    <Flex justify="start" align="center" gap="sm">
                      <ActionIcon
                        size="sm"
                        color="gray"
                        onClick={() => updateQuantity(item.id, "decrement")}
                        sx={{border: '1px solid gray'}}
                      >
                        -
                      </ActionIcon>
                      <Text>{item.quantity}</Text>
                      <ActionIcon
                        size="sm"
                        color="gray"
                        onClick={() => updateQuantity(item.id, "increment")}
                        sx={{border: '1px solid gray'}}
                      >
                        +
                      </ActionIcon>
                    </Flex>
                  </Grid.Col>
                  
                  {/* Total Price */}
                  <Grid.Col span={4}>
                    <Text>SDG{(item.quantity * item.price).toFixed(2)}</Text>
                  </Grid.Col>
                  
                  {/* Delete Icon */}
                  
                </Grid>
              </Group>
            ))}
            <Divider my="sm" />
            <Text weight={500} size="lg" mb="sm">
              Payment
            </Text>
            <Group position="apart" mb="xs">
              <Text>Net Total</Text>
              <Text>SDG {calculateNetTotal().toFixed(2)}</Text>
            </Group>
            <Select
              label="Payment Type"
              defaultValue="Cash"
              data={["Cash", "Bankak", "Fawry"]}
              mb="md"
              placeholder="Pick one"
              // searchable
              nothingFound="No options"
            />
            {<TextInput placeholder="mbok transaction ID" />}
            <Group position="apart">
              <Button variant="light" color="gray">
                Reset
              </Button>
              <Button color="green" onClick={() => setOpened(!opened) }>Finish</Button>
              <Modal opened={opened}>
                <Modal.Body>
                  <Text mb="lg">Order finished!</Text>
                  <Group>
                    <Button color="gray" variant="outline" onClick={() => setOpened(!opened)}>Go back</Button>
                    <Button>Print receipt</Button>
                  </Group>
                </Modal.Body>
                {/* <Modal.CloseButton onClick={() => setOpened(!opened)} /> */}
              </Modal>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default Sales;
