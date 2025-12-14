import React, { useState } from "react";
import {
  Container,
  TextInput,
  NumberInput,
  Select,
  Button,
  Paper,
  Text,
  Flex,
} from "@mantine/core";
import { DateInput, DatePickerInput } from "@mantine/dates";
import { useTranslation } from "react-i18next";

const ProductForm = ({ close, form, handleSubmit }) => {
  const [expiryDate, setExpiryDate] = useState(null);
  const BASE_URL = import.meta.env.VITE_URL
  const { t } = useTranslation();

  return (
    <Container size="xl">
      <Text align="center" size="lg" weight={600} mb="md">
        {t("Add-Product-to-Inventory")}
      </Text>
      <Paper shadow="xl" p="lg" radius="md" withBorder>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Flex justify="space-between" mb="md" gap="md">
            <TextInput
              label={t("Product-Name")}
              placeholder={t("Type-Product-Name")}
              {...form.getInputProps("product")}
              required
              sx={{ flex: 1 }}
            />
            <TextInput
              label={t("Barcode")}
              placeholder={t("Enter-Barcode")}
              {...form.getInputProps("barcodeID")}
              required
              sx={{ flex: 1 }}
            />
            <TextInput
              label={t("Shelf")}
              placeholder={t("Enter-Shelf")}
              {...form.getInputProps("shelf")}
              required
              sx={{ flex: 1 }}
            />
          </Flex>

          <Flex justify="space-between" mb="md" gap="md">
            <NumberInput
              label={t("Quantity")}
              placeholder="Enter product quantity"
              {...form.getInputProps("quantity")}
              required
              min={1}
              sx={{ flex: 1 }}
            />
            <Select
              label={t("Unit")}
              placeholder={t("Select-Product-Unit")}
              data={[
                { value: "strip", label: t("Strip") },
                { value: "bottle", label: t("Bottle") },
                { value: "piece", label: t("Piece") },
              ]}
              {...form.getInputProps("unit")}
              required
              sx={{ flex: 1 }}
            />
            {/* <DatePickerInput
              label="Expiry Date"
              placeholder="Pick expiry date"
              value={expiryDate}
              onChange={(date) => {
                setExpiryDate(date);
                form.setFieldValue("expiryDate", date);
              }}
              size="md"
              sx={{ flex: 1 }}
              popoverProps={{ withinPortal: true }}
            /> */}
            
            <DateInput
              label={t("Expiry-Date")}
              placeholder={t("Pick-Expiry-Date")}
              value={expiryDate}
              onChange={(date) => {
                setExpiryDate(date);
                form.setFieldValue("expiryDate", date);
              }}
              size="sm" // Matches other inputs
              allowDeselect // Allows clearing date
              allowFreeInput // Enables manual date entry
              valueFormat="DD-MM-YYYY" // Ensures correct format when typing
              styles={{
                input: { height: "38px" }, // Forces same height as other inputs
              }}
              sx={{ flex: 1 }}
              popoverProps={{ withinPortal: true }}
            />


          </Flex>

          <Flex justify="space-between" mb="md" gap="md">
            <NumberInput
              label={t("Purchase-Price")}
              placeholder={t("Enter-Purchase-Price")}
              {...form.getInputProps("unitPurchasePrice")}
              required
              min={0.01}
              precision={2}
              sx={{ flex: 1 }}
            />
            <NumberInput
              label={t("Sale-Price")}
              placeholder={t("Enter-Sale-Price")}
              {...form.getInputProps("unitSalePrice")}
              required
              min={0.01}
              precision={2}
              sx={{ flex: 1 }}
            />
          </Flex>
        </form>
      </Paper>

      {/* Buttons Outside Paper, Separated on Left & Right */}
      <Flex justify="space-between" mt="lg">
        <Button type="submit" variant="filled" color="blue" onClick={form.onSubmit(handleSubmit)}>
          {t("Add-Product")}
        </Button>
        <Button variant="filled" color="gray" onClick={close}>
          {t("CANCEL")}
        </Button>
      </Flex>
    </Container>
  );
};

export default ProductForm;
