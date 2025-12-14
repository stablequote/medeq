import { useEffect, useRef, useState, useMemo } from 'react';
import {ActionIcon, Box, Button, Center, Container, FileInput, Flex, Group, Loader, Modal, NumberInput, Select, StarIcon, Text, TextInput, Tooltip, useMantineTheme} from "@mantine/core"
import DataGrid from '../components/DataGrid';
import { IconArrowBack, IconDownload, IconEdit, IconFileImport, IconFileSearch, IconInputSearch, IconPlus, IconTrash } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import ProductForm from '../components/ProductForm';
import axios from 'axios';
import * as XLSX from "xlsx";
import { showNotification } from '@mantine/notifications';
import moment from 'moment';
import { useForm } from "@mantine/form";
import { useTranslation } from 'react-i18next';
import CustomTable from '../components/CustomTable';
import { mkConfig, generateCsv, download } from 'export-to-csv';

const Inventory = () => {
  const openRef = useRef(null);
  const [opened, { open, close }] = useDisclosure(false);
  const [inventoryData, setInventoryData] = useState([])
  const [excelData, setExcelData] = useState([]); // State to store the parsed data
  const theme = useMantineTheme();
  const { t } = useTranslation();

  const [editRow, setEditRow] = useState(null);
  const [deleteRow, setDeleteRow] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [salesData, setSalesData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // copied from ahs ==> states for table management
  const [rowSelection, setRowSelection] = useState({});
  const [checkedRow, setCheckedRow] = useState([])

  const BASE_URL = import.meta.env.VITE_URL

  const form = useForm({
    initialValues: {
      product: "",
      quantity: 0,
      unit: "",
      expiryDate: null,
      unitPurchasePrice: 0,
      unitSalePrice: 0,
      shelf: "",
      barcodeID: "",
    },

    validate: {
      product: (value) =>
        value.trim().length < 3 ? "Product name must have at least 3 characters" : null,
      quantity: (value) => (value <= 0 ? "Quantity must be greater than 0" : null),
      unit: (value) => (value.trim().length === 0 ? "Unit is required" : null),
      expiryDate: (value) => (!value ? "Expiry date is required" : null),
      unitPurchasePrice: (value) =>
        value <= 0 ? "Purchase price must be greater than 0" : null,
      unitSalePrice: (value) =>
        value <= 0 ? "Sale price must be greater than 0" : null,
      shelf: (value) => (value.trim().length === 0 ? "Shelf is required" : null),
      barcodeID: (value) => (value.trim().length === 0 ? "Barcode ID is required" : null),
    },
  });

  const handleSubmit = async (values) => {
    try {
      console.log("Submitting product details:", values);

      const formattedValues = {
        ...values,
        expiryDate: values.expiryDate ? new Date(values.expiryDate).toISOString() : null,
      };
      
      const url = `${BASE_URL}/inventory/add`
      const res = await axios.post(url, formattedValues);
      console.log(res)
      
      if(res.status === 201) {
        const newProduct = res.data.product; // ✅ Get the newly added product from server response
        
        showNotification({
          title: "Successfully added!",
          message: "Congrats! You have successfully added a new products",
          color: "green",
        })
        
        // ✅ Update state with new product
        setInventoryData((prev) => [...prev, newProduct]);
      }

      form.reset()
      
      close();
    } catch (error) {
      console.error("Error submitting product:", error);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "barcodeID",
        header: t("Barcode"),
        size: 40,
      },
      {
        accessorKey: "product",
        header: t("Product"),
        size: 120,
      },
      {
        accessorKey: "shelf",
        header: t("Shelf"),
        size: 40,
      },
      {
        accessorKey: "quantity",
        header: t("Quantity"),
        size: 120,
        Cell: ({ cell }) => (
          <Box
            sx={(theme) => ({
              backgroundColor:
                cell.getValue() < 20 ? theme.colors.red[9] : theme.colors.white,
              borderRadius: "4px",
              color: cell.getValue() < 100 ? "black" : theme.colors.blue,
              maxWidth: "9ch",
              padding: "4px",
            })}
          >
            {cell.getValue()?.toLocaleString?.("en-US", {
              currency: "SDG",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Box>
        ),
      },
      {
        accessorKey: "unit",
        header: t("Unit"),
        size: 120,
      },
      {
        accessorKey: "expiryDate",
        header: t("Expiry-Date"),
        size: 100,
        Cell: ({ cell }) => (
          <Box>{moment(cell.getValue()).format("DD-MMMM-YYYY")}</Box>
        ),
      },
      {
        accessorKey: "unitPurchasePrice",
        header: t("Purchase-Price"),
        size: 100,
        Cell: ({ cell }) => (
          <Box
            sx={{
              borderRadius: "4px",
              maxWidth: "9ch",
              padding: "4px",
            }}
          >
            {cell.getValue()?.toLocaleString?.("en-US", {
              style: "currency",
              currency: "SDG",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Box>
        ),
      },
      {
        accessorKey: "unitSalePrice",
        header: t("Sale-Price"),
        size: 100,
        Cell: ({ cell }) => (
          <Box
            sx={{
              borderRadius: "4px",
              maxWidth: "9ch",
              padding: "4px",
            }}
          >
            {cell.getValue()?.toLocaleString?.("en-US", {
              style: "currency",
              currency: "SDG",
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Box>
        ),
      },
    ],
    [t] // ✅ This ensures translation updates when language changes
  );

  const fetchInventoryData = async (url) => {
    try {
      const res = await axios.get(url);
      console.log(res);
      setInventoryData(res.data);
    } catch (error) {
      console.error('Error fetching inventory data:', error);
      setInventoryData([]); // Set to empty array in case of error
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (!file) return;

    const reader = new FileReader(); // Create a file reader

    // Read the file as a binary string
    reader.onload = (e) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: "binary" }); // Parse the Excel file
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = workbook.Sheets[sheetName]; // Get the sheet data

      // Convert the sheet data to JSON
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      // Extract headers (first row) and map them to the data
      const headers = jsonData[0]; // First row is the headers
      const rows = jsonData.slice(1); // Remaining rows are the data

      // Transform the data into an array of objects
      const mappedData = rows.map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index]; // Map each header to its corresponding cell value
        });
        return obj;
      });

      console.log(mappedData)

      setExcelData(mappedData); // Update the state with the mapped data
      sendDataToBackend(mappedData)
    };

    reader.readAsBinaryString(file); // Read the file
  };

  // Function to send data to backend server
  const sendDataToBackend = async (data) => {
    // const url = "http://localhost:5005/inventory/import-from-excel";
    const url = `${BASE_URL}/inventory/import-from-excel`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send data to the server');
      }

      const result = await response.json();
      console.log('Server response:', result);
      showNotification({
        title: "Successful import!",
        message: "Congrats! You have successfully imported all products",
        color: "green",
      })
    } catch (err) {
      console.error('Error:', err);
      showNotification({
        title: "Error importing products",
        message: "An error occured while importing product. Please Try again",
        color: "red",
      })
    }
  };

  useEffect(() => {
    // const url = "http://localhost:5005/inventory/list-all";
    const url = `${BASE_URL}/inventory/list-all`
    fetchInventoryData(url)
    console.log(url) // "123"

  }, [])

   // Edit Modal Handlers
   const handleEdit = (row) => {
    setEditRow(row);
    setEditModalOpen(true);
    console.log(row)
  };

  const handleSaveEdit = async () => {
    // console.log(editRow)
    // setData((prev) =>
    //   prev.map((item) => (item.id === editRow.id ? editRow : item)))
    try {
      const productID = editRow._id
      console.log(productID)
      const url = `${BASE_URL}/inventory/update/${productID}`
      const res = await axios.put(url, editRow)
      console.log(res)
    } catch (error) {
      console.log(error)
    } finally {
      setEditModalOpen(false);
    }
  };

  // Delete Modal Handlers
  const handleDelete = (row) => {
    console.log(row.original)
    setDeleteRow(row.original);
    setDeleteModalOpen(true);
  };

  // confirm deletion function
  const confirmDelete = async () => {
    // const product = window.confirm("Are you sure you want to delete this product?")
    // if(!product) return;
    try {
      const id = deleteRow._id;
      const url = `${BASE_URL}/inventory/delete/${id}`
      // send axios delete
      const response = await axios.delete(url, id);
      if(response.status === 200) {
        showNotification({
          title: "success",
          message: "You have successfully deleted an item",
          color: "green"
        })
        // updating state
        setInventoryData((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (error) {
      showNotification({
        title: "Server error",
        message: "An error on the server, please try again",
        color: "red"
      })
    }
    setDeleteModalOpen(!deleteModalOpen)
  };

  const handleSaveCell = (cell, value) => {
    //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here
    tableData[cell.row.index][cell.column.id] = value;
    //send/receive api updates here
    setTableData([...tableData]); //re-render with new data
  };

  const handleSaveRow = async ({ table, row, values }) => {
    //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here.
    tableData[row.index] = values;
    //send/receive api updates here
    setTableData([...tableData]);
    table.setEditingRow(null); //exit editing mode
  };
  
  const csvConfig = mkConfig({
    fieldSeparator: ',',
    decimalSeparator: '.',
    useKeysAsHeaders: true,
  });

  const handleExportRows = (rows) => {
    const rowData = rows.map((row) => row.original);
    const csv = generateCsv(csvConfig)(rowData);
    download(csvConfig)(csv);
  };

  const handleExportData = () => {
    const csv = generateCsv(csvConfig)(inventoryData);
    download(csvConfig)(csv);
  };

  const customTableOptions = {
    renderTopToolbarCustomActions: ({ table }) => (
    <Box
      sx={{
        display: 'flex',
        gap: '16px',
        padding: '8px',
        flexWrap: 'wrap',
      }}
    >
      <Button
        color="lightblue"
        //export all data that is currently in the table (ignore pagination, sorting, filtering, etc.)
        onClick={handleExportData}
        leftIcon={<IconDownload />}
        variant="filled"
      >
        {t("EXPORT-ALL-DATA")}
      </Button>
      <Button
        disabled={table.getPrePaginationRowModel().rows.length === 0}
        //export all rows, including from the next page, (still respects filtering and sorting)
        onClick={() =>
          handleExportRows(table.getPrePaginationRowModel().rows)
        }
        leftIcon={<IconDownload />}
        variant="filled"
      >
        {t("EXPORT-ALL-ROWS")}
      </Button>
      <Button
        disabled={table.getRowModel().rows.length === 0}
        //export all rows as seen on the screen (respects pagination, sorting, filtering, etc.)
        onClick={() => handleExportRows(table.getRowModel().rows)}
        leftIcon={<IconDownload />}
        variant="filled"
      >
        {t("EXPORT-PAGE-ROWS")}
      </Button>
      <Button
        disabled={
          !table.getIsSomeRowsSelected() && !table.getIsAllRowsSelected()
        }
        //only export selected rows
        onClick={() => handleExportRows(table.getSelectedRowModel().rows)}
        leftIcon={<IconDownload />}
        variant="filled"
      >
        {t("EXPORT-SELECTED-ROWS")}
      </Button>
    </Box>
    ),
    renderRowActions: ({ row, table }) => {
      return (
        <Flex justify="flex-start">
          <Tooltip label="Delete" >
            <Button
              mr="md"
              color="red"
              // onClick={() => handleActionClick(row.original)}
              onClick={() => handleDelete(row)}
              // disabled={row?.original.registrations[0]?.department !== "lab" ? true : false}
            >
              <IconTrash color="white" />
            </Button>
          </Tooltip>
          <Tooltip label="Edit">
            <Button
              color="blue"
              onClick={() => table.setEditingRow(row)}
              // onClick={() => console.log(row.original)}
              // disabled={row?.original.registrations[0]?.department !== "lab" ? true : false}
            >
              <IconEdit color="white" />
            </Button>
          </Tooltip>
        </Flex>
      );
    },
    onRowSelectionChange: (updater) => {
      const newRowSelection =
        typeof updater === 'function' ? updater(rowSelection) : updater;

      setRowSelection(newRowSelection);

      // testing
      setCheckedRow(Object.keys(newRowSelection).map((rowId) => table.getRow(rowId).original))
      console.log(checkedRow)

      // If using MRT table instance (like with useMantineReactTable)
      const selectedData = Object.keys(newRowSelection).map((rowId) =>
        table.getRow(rowId).original
      );

      setCheckedRow(selectedData)

      // console.log('✅ Selected row data:', selectedData);
    },
    onEditingRowSave: async ({table, row, values}) => {
      //if using flat data and simple accessorKeys/ids, you can just do a simple assignment here.
      tableData[row.index] = values;
      console.log(row.original)
      console.log(values)
      const id = row.original._id;
      try {
        const url = `${BASE_URL}/inventory/update/${id}`
        const res = await axios.put(url, values)
        // console.log(res)
        if(res.status === 200) {
          setTableData([res.data]);
          showNotification({
            title: "success",
            message: "Inventory successfully updated!",
            color: "green"
          })
          table.setEditingRow(null); //exit editing mode
        }
      } catch (error) {
        console.log(error)
      }
      //send/receive api updates here
      // setTableData([...tableData]);
      // table.setEditingRow(null); //exit editing mode
    },
  }

  return (
    <Container size="100%">
      <Flex justify="space-between" height={415} mb="xs" >
          <Button 
            variant="filled" 
            color='blue' 
            leftIcon={<IconPlus size={18} />} 
            // ml={15}
            onClick={open}
          >
            {t("Add")}
          </Button>
        {/* <Flex >
          <TextInput placeholder='enter product name/ID' sx={{width: 320}} height={415} mb={4} />
        </Flex> */}
        
        {/* File input for Excel upload */}
        <Group position="center" >
          <input
            type="file"
            accept="text/csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            id="file-upload"
          />
          <label htmlFor="file-upload">
            <Button
              component="span" 
              sx={{
                backgroundColor: theme.colors.green[9], // Default green color
                "&:hover": {
                  backgroundColor: theme.colors.green[7], // Slightly lighter green on hover
                },
                }} 
                leftIcon={<IconFileImport />}
                >
                {t("Import-From-Excel")}
            </Button>
          </label>
        </Group>
      </Flex>
      <Modal size={800} opened={opened} centered withCloseButton={false}>
        <ProductForm close={close} form={form} handleSubmit={handleSubmit}  />
      </Modal>
      {/* {inventoryData.length > 0 ? <DataGrid inventoryData={inventoryData} /> : <p>Loading inventory data...</p>} */}
      {/* <DataGrid data={inventoryData} columns={columns} deleteModalOpen={deleteModalOpen} setDeleteModalOpen={setDeleteModalOpen} handleDelete={handleDelete}  /> */}
      <CustomTable
        data={inventoryData} 
        columns={columns} 
        // onRowClick={(row) => displayInvoice2(row)}
        renderTopToolbarCustomActions={customTableOptions.renderTopToolbarCustomActions}
        renderRowActions={customTableOptions.renderRowActions}
        onEditingRowSave={customTableOptions.onEditingRowSave}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        checkedRow={checkedRow}
        setCheckedRow={setCheckedRow}
        deleteModalOpen={deleteModalOpen} 
        setDeleteModalOpen={setDeleteModalOpen} 
        handleDelete={handleDelete}
        handleSaveCell={handleSaveCell}
      />
      {/* Edit Modal */}
      <Modal opened={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Product">
        <TextInput
          label="Product Name"
          name="product"
          value={editRow?.product || ''}
          onChange={(e) => setEditRow({ ...editRow, name: e.target.value })}
        />
        <TextInput
          label="Shelf"
          name="shelf"
          value={editRow?.shelf || ''}
          onChange={(e) => setEditRow({ ...editRow, shelf: e.target.value })}
        />
        <NumberInput
        label="Quantity"
        name="quantity"
        value={editRow?.quantity || ''}
        onChange={(e) => setEditRow({ ...editRow, quantity: e.target.value })}
        />
        <Group position="right" mt="md">
          <Button onClick={handleSaveEdit}>Save</Button>
        </Group>
      </Modal>
      {/* Delete Confirmation Modal */}
      <Modal opened={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion">
        <p>Are you sure you want to delete <br /> <strong>{deleteRow?.product}</strong>?</p>
        <Group position="right" mt="md">
          <Button color="red" onClick={confirmDelete}>Delete</Button>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancel</Button>
        </Group>
      </Modal>
    </Container>
  );
};

export default Inventory;