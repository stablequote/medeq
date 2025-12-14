import { Paper, Group, Text, Divider, Button, Select, TextInput, Flex, NumberInput } from '@mantine/core'
import { notifications, showNotification } from '@mantine/notifications'
import { useTranslation } from 'react-i18next';

function CartPaymentSection({ 
  calculateNetTotal, 
  payment, 
  setPayment, 
  setReceiptVisible, 
  receiptVisible, 
  resetCart, 
  cart, 
  setCart, 
  handlePayment, 
  discountPercentage, 
  setDiscountPercentage, 
  calculateDiscountedTotal, 
  applyDiscount, 
  totalAfterDiscount, 
  roundToNearestHundred,
  // ,
  // setDiscountByAmount,
  applyDiscountAmount,
  discountAmount,
  setDiscountAmount,
  discountType,
  setDiscountType
}) {

  const { t } = useTranslation();

  const makePayment = async () => {
    if(cart.length > 0) {
      setReceiptVisible(!receiptVisible)
      notifications.show({
          title: 'Success',
          message: 'Product has been successfully paid! 🤥',
          styles: (theme) => ({
              root: {
                backgroundColor: theme.colors.green[6],
              //   borderColor: theme.colors.

                '&::before': { backgroundColor: theme.white },
              },

              title: { color: theme.white },
              description: { color: theme.white },
              closeButton: {
                color: theme.white,
                '&:hover': { backgroundColor: theme.colors.blue[7] },
              },
            }),
      })
    } else {
      showNotification({
        title: "No item!",
        message: "At least one item should be added",
        color: "red",
      })
    }
  }

  // const applyDiscount = () => {
  //   return cart.reduce((total, item) => (total + item.quantity * item.unitSalePrice) * discount/100, 0)
  // };

  // const applyDiscount = () => {
  //   if (!cart.length) return; // Prevent errors if cart is empty
  
  //   const discountFactor = discountPercentage / 100;
  
  //   const updatedCart = cart.map((item) => {
  //     const discountAmount = item.unitSalePrice * discountFactor;
  //     const discountedPrice = item.unitSalePrice - discountAmount;
  
  //     return {
  //       ...item,
  //       discountAmount: discountAmount * item.quantity, // Total discount for the item
  //       discountedPrice: discountedPrice, // New price per item after discount
  //       totalPrice: discountedPrice * item.quantity, // Updated total price per item
  //     };
  //   });
  
  //   setCart(updatedCart); // Update the cart with new discounted prices
  // };

  // const totalAfterDiscount = useMemo(() => 
  //   cart.reduce((total, item) => total + item.totalPrice, 0),
  //   [cart]
  // );

  // const handleChange = (e) => {
  //   setDiscount(e.target.value);
  //   console.log(discount)
  // }

  // const roundToNearestHundred = (number) => {
  //   return Math.ceil(number / 100) * 100;
  // }
    
  return (
    <Paper shadow="xs" p="md" radius="lg">
      <Text weight={500} size="lg" mb="sm">
      {t("Payment")}
      </Text>
      <Divider my="sm" />
      <Flex justify="space-between" align="center" mb="xl">
        <Select
          label="Discount Type"
          data={[
            { value: "percent", label: "By Percentage" },
            { value: "amount", label: "By Amount" },
          ]}
          value={discountType}
          onChange={setDiscountType}
          sx={{width: "160px !important"}}
        />

        {discountType === "percent" ? (
          <NumberInput
            label="Discount (%)"
            value={discountPercentage}
            onChange={(value) => setDiscountPercentage(value)}
            min={0}
            max={100}
            sx={{width: "140px !important"}}
          />
        ) : (
          <NumberInput
            label="Discount Amount"
            value={discountAmount}
            onChange={(value) => setDiscountAmount(value)}
            min={0}
            max={100000}
            sx={{width: "140px !important"}}
          />
        )}
        <Button mt={20} onClick={applyDiscount}>{t("Apply")}</Button>
      </Flex>
      {/* <Flex justify="space-between" mb="md">
        <Group>
          <Text>{t("Discount")}</Text>
          <NumberInput sx={{width: 80}} 
            value={discountPercentage}
            onChange={(value) => setDiscountPercentage(value)} // Ensure value is a number
            min={0}
            max={100}
            step={1}
            hideControls
          />
          <span>%</span>
        </Group>
        <Button onClick={applyDiscount}>{t("Apply")}</Button>
      </Flex> */}
      {/* <Flex justify="space-between" mb="md">
        <Group mb="md">
          <Text>{t("Discount-BY-AMOUNT")}</Text>
          <NumberInput sx={{width: 80}}
            value={discountAmount}
            onChange={(val) => setDiscountAmount(val)}
            min={0}
            max={10000}
            step={1}
            hideControls
          />
          <span>SDG</span>
        </Group>
        <Button onClick={applyDiscountAmount}>{t("Apply")}</Button>
      </Flex> */}
      <Group position="apart" mb="xs">
        <Text>{t("Total")}</Text>
        <Text>SDG {calculateNetTotal().toFixed(2)}</Text>
      </Group>
      <Group position="apart" mb="xs">
        <Text>{t("Total-After-Discount")}</Text>
        <Text>{ totalAfterDiscount > 0 ?  roundToNearestHundred( totalAfterDiscount.toFixed(2) ) : calculateNetTotal().toFixed(2)  }</Text>
      </Group>
      <Select
        label={t("Payment-Method")}
        placeholder={t("Select-Payment-Method")}
        // value={payment.paymentType}
        // value="Cash"
        onChange={(value) =>
          setPayment((prev) => ({ ...prev, paymentType: value }))
        }
        data={["Cash", "Bankak", "Fawry", "Cash + Bankak", "Cashout"]}
        mb="xs"
      />
      {payment.paymentType === "Cash + Bankak" && (
        <Flex justify="space-between" mb="xs">
          <NumberInput
            label="Cash Amount"
            // value={bankakAmount}
            onChange={(value) => setPayment((prev) => ({ ...prev, cashAmount: value }))}
            required
          />
          <NumberInput
            label="Bankak Amount"
            // value={cashAmount}
            onChange={(value) => setPayment((prev) => ({ ...prev, bankakAmount: value }))}
            required
          />
        </Flex>
      )}          
      {
        payment.paymentType === "Bankak" ?
        <TextInput 
          placeholder='enter trx. ID' 
          mb="md" 
          onChange={(value) => setPayment((prev) => ({ ...prev, transactionID: value }))} 
        />
        :  payment.paymentType === "Cash + Bankak" ?
        <TextInput 
          placeholder='enter trx. ID' 
          mb="md" 
          onChange={(value) => setPayment((prev) => ({ ...prev, transactionID: value }))} 
        /> : ''
      }
      {
        payment.paymentType == "Cashout" && 
        <NumberInput 
          label="Amount to Transfer" 
          placeholder='Enter total transferred amount' 
          mb="md" 
          onChange={(value) => setPayment((prev) => ({ ...prev, cashoutAmount: value }))}
        />
      }
      <Group position="apart">
        <Button variant="outline" color="red" onClick={() => resetCart()}>{t("RESET")}</Button>
        <Button color="green" onClick={() => handlePayment()}>{t("CONFIRM")}</Button>
      </Group>
    </Paper>
  )}

export default CartPaymentSection