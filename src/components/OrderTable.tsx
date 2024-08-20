import { useState, Fragment, useMemo } from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import {
  Avatar,
  Box,
  Chip,
  FormControl,
  FormLabel,
  Input,
  Select,
  Option,
  Table,
  Sheet,
  Typography,
  Link,
} from '@mui/joy';

import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

import db from '../assets/db.json';
import { cleanString, isDateInPastOrFuture } from '../utils';

type DataFields = keyof (typeof db.reservations)[0];
type Order = 'asc' | 'desc';
interface FilterObject {
  customerName: string;
  status: string;
  date: string;
  shift: string;
  area: string;
}

const COLUMNS: { id: DataFields; label: string }[] = [
  { id: 'id', label: 'Reservation #' },
  { id: 'businessDate', label: 'Business date' },
  { id: 'status', label: 'Status' },
  { id: 'shift', label: 'Shift' },
  { id: 'start', label: 'Start date' },
  { id: 'end', label: 'End date' },
  { id: 'quantity', label: 'Quantity' },
  { id: 'customer', label: 'Customer' },
  { id: 'area', label: 'Area' },
  { id: 'guestNotes', label: 'Guest Notes' },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export default function OrderTable() {
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<DataFields>('id');
  const [filterObject, setFilterObject] = useState<FilterObject>({
    customerName: '',
    status: '',
    date: '',
    shift: '',
    area: '',
  });

  const transformedData = useMemo(
    () =>
      db.reservations.map((res) => ({
        ...res,
        customer: `${res.customer.firstName} ${res.customer.lastName}`,
      })),
    []
  );

  const filteredData = useMemo(() => {
    const cleanedCustomerName = cleanString(filterObject.customerName);
    return transformedData.filter((row) => {
      return (
        row.customer.toLowerCase().includes(cleanedCustomerName) &&
        (!filterObject.status || row.status === filterObject.status) &&
        (!filterObject.shift || row.shift === filterObject.shift) &&
        (!filterObject.area || row.area === filterObject.area) &&
        (!filterObject.date ||
          isDateInPastOrFuture(row.businessDate) === filterObject.date)
      );
    });
  }, [filterObject, transformedData]);

  return (
    <Fragment>
      <Box
        className="SearchAndFilters-tabletUp"
        sx={{
          borderRadius: 'sm',
          py: 2,
          display: { xs: 'none', sm: 'flex' },
          flexWrap: 'wrap',
          gap: 1.5,
          '& > *': {
            minWidth: { xs: '120px', md: '160px' },
          },
        }}
      >
        <FormControl sx={{ flex: 1 }} size="sm">
          <FormLabel>Search for order</FormLabel>
          <Input
            size="sm"
            placeholder="Search"
            startDecorator={<SearchIcon />}
            value={filterObject.customerName}
            onChange={(e) =>
              setFilterObject((prev) => ({
                ...prev,
                customerName: e.target.value,
              }))
            }
          />
        </FormControl>
        <Fragment>
          <FormControl size="sm">
            <FormLabel>Status</FormLabel>
            <Select
              size="sm"
              placeholder="Filter by status"
              onChange={(_, newValue) =>
                setFilterObject((prev) => ({
                  ...prev,
                  status: newValue as string,
                }))
              }
              value={filterObject.status}
            >
              {['CONFIRMED', 'SEATED', 'CHECKED OUT', 'NOT CONFIRMED'].map(
                (status) => (
                  <Option key={status} value={status}>
                    {status}
                  </Option>
                )
              )}
            </Select>
          </FormControl>
          <FormControl size="sm">
            <FormLabel>Date</FormLabel>
            <Select
              size="sm"
              placeholder="Filter by date"
              onChange={(_, newValue) =>
                setFilterObject((prev) => ({
                  ...prev,
                  date: newValue as string,
                }))
              }
              value={filterObject.date}
            >
              <Option value="past">Past</Option>
              <Option value="future">Future</Option>
            </Select>
          </FormControl>
          <FormControl size="sm">
            <FormLabel>Shifts</FormLabel>
            <Select
              size="sm"
              placeholder="Filter by shift"
              onChange={(_, newValue) =>
                setFilterObject((prev) => ({
                  ...prev,
                  shift: newValue as string,
                }))
              }
              value={filterObject.shift}
            >
              {['BREAKFAST', 'LUNCH', 'DINNER'].map((shift) => (
                <Option key={shift} value={shift}>
                  {shift}
                </Option>
              ))}
            </Select>
          </FormControl>
          <FormControl size="sm">
            <FormLabel>Area</FormLabel>
            <Select
              size="sm"
              placeholder="Filter by area"
              onChange={(_, newValue) =>
                setFilterObject((prev) => ({
                  ...prev,
                  area: newValue as string,
                }))
              }
              value={filterObject.area}
            >
              <Option value="BAR">BAR</Option>
              <Option value="LUNCH">MAIN ROOM</Option>
            </Select>
          </FormControl>
        </Fragment>
      </Box>
      <Sheet
        className="OrderTableContainer"
        variant="outlined"
        sx={{
          display: { xs: 'none', sm: 'initial' },
          width: '100%',
          borderRadius: 'sm',
          flexShrink: 1,
          overflow: 'auto',
          minHeight: 0,
        }}
      >
        <Table
          aria-labelledby="tableTitle"
          stickyHeader
          hoverRow
          sx={{
            '--TableCell-headBackground':
              'var(--joy-palette-background-level1)',
            '--Table-headerUnderlineThickness': '1px',
            '--TableRow-hoverBackground':
              'var(--joy-palette-background-level1)',
            '--TableCell-paddingY': '4px',
            '--TableCell-paddingX': '8px',
          }}
        >
          <thead>
            <tr>
              {COLUMNS.map((column) => (
                <th key={column.id} style={{ width: 120, padding: '12px 6px' }}>
                  <Link
                    underline="none"
                    color="primary"
                    component="button"
                    onClick={() => {
                      setOrder(order === 'asc' ? 'desc' : 'asc');
                      setOrderBy(column.id);
                    }}
                    fontWeight="lg"
                    endDecorator={<ArrowDropDownIcon />}
                    sx={{
                      '& svg': {
                        transition: '0.2s',
                        transform:
                          order === 'desc' ? 'rotate(0deg)' : 'rotate(180deg)',
                      },
                    }}
                  >
                    {column.label}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData
              .slice()
              .sort(getComparator(order, orderBy))
              .map((row) => (
                <tr key={row.id}>
                  <td>
                    <Typography level="body-xs">{row.id}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.businessDate}</Typography>
                  </td>
                  <td>
                    <Chip
                      variant="soft"
                      size="sm"
                      startDecorator={
                        {
                          CONFIRMED: <CheckRoundedIcon />,
                          SEATED: <CheckRoundedIcon />,
                          'CHECKED OUT': <AutorenewRoundedIcon />,
                          'NOT CONFIRMED': <BlockIcon />,
                        }[row.status]
                      }
                      color={
                        {
                          CONFIRMED: 'success',
                          'CHECKED OUT': 'neutral',
                          'NOT CONFIRMED': 'danger',
                          SEATED: 'success',
                        }[row.status] as ColorPaletteProp
                      }
                    >
                      {row.status}
                    </Chip>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.shift}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.start}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.end}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.quantity}</Typography>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <Avatar size="sm">
                        {row.customer.split(' ')[0].charAt(0) +
                          row.customer.split(' ')[1].charAt(0)}
                      </Avatar>
                      <div>
                        <Typography level="body-xs">{row.customer}</Typography>
                      </div>
                    </Box>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.area}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs">{row.guestNotes}</Typography>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </Sheet>
    </Fragment>
  );
}
