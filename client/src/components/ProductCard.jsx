import { Card, Image, Text, Button, Group, Badge } from "@mantine/core";

const ProductCard = ({ product, addToCart }) => {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder mt="xl" sx={{width: 300}}>
      <Card.Section >
        <Image src={product.image} height={160} alt={product.name} />
      </Card.Section>
      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{product.product}</Text>
        {product.onSale && <Badge color="red">Sale</Badge>}
      </Group>
      <Text size="sm" color="dimmed">
        {product.description}
      </Text>
      <Text size="lg" weight={700} mt="sm">
        SDG {product.unitSalePrice}
      </Text>
      <Button fullWidth mt="md" radius="md" color="blue" onClick={() => addToCart(product)}>
        Add to Cart
      </Button>
    </Card>
  );
};

export default ProductCard;

// // Example Usage
// const sampleProduct = {
//   name: "Wireless Headphones",
//   description: "High-quality sound with noise cancellation.",
//   price: 99.99,
//   image: "https://via.placeholder.com/300",
//   onSale: true,
// };
