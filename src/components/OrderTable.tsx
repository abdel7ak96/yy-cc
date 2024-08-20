import { useState, Fragment } from 'react';
import { ColorPaletteProp } from '@mui/joy/styles';
import Avatar from '@mui/joy/Avatar';
import Box from '@mui/joy/Box';
import Chip from '@mui/joy/Chip';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import Link from '@mui/joy/Link';
import Input from '@mui/joy/Input';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';
import Table from '@mui/joy/Table';
import Sheet from '@mui/joy/Sheet';
import Typography from '@mui/joy/Typography';

import SearchIcon from '@mui/icons-material/Search';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import BlockIcon from '@mui/icons-material/Block';
import AutorenewRoundedIcon from '@mui/icons-material/AutorenewRounded';

import db from '../assets/db.json';

type DataFields = keyof (typeof db.reservations)[0];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = 'asc' | 'desc';

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

const COLUMNS: { id: DataFields; label: string }[] = [
  {
    id: 'id',
    label: 'Reservation #',
  },
  {
    id: 'businessDate',
    label: 'Business date',
  },
  {
    id: 'status',
    label: 'Status',
  },
  {
    id: 'shift',
    label: 'Shift',
  },
  {
    id: 'start',
    label: 'Start date',
  },
  {
    id: 'end',
    label: 'End date',
  },
  {
    id: 'quantity',
    label: 'Quantity',
  },
  {
    id: 'customer',
    label: 'Customer',
  },
  {
    id: 'area',
    label: 'Area',
  },
  {
    id: 'guestNotes',
    label: 'Guest Notes',
  },
];

export default function OrderTable() {
  const [order, setOrder] = useState<Order>('asc');
  db.reservations;
  const [orderBy, setOrderBy] = useState<DataFields>('id');
  const renderFilters = () => (
    <Fragment>
      <FormControl size="sm">
        <FormLabel>Status</FormLabel>
        <Select
          size="sm"
          placeholder="Filter by status"
          slotProps={{ button: { sx: { whiteSpace: 'nowrap' } } }}
        >
          <Option value="confirmed">Confirmed</Option>
          <Option value="seated">Seated</Option>
          <Option value="checkedOut">Checked out</Option>
          <Option value="notConfirmed">Not confirmed</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Date</FormLabel>
        <Select size="sm" placeholder="Filter by date">
          <Option value="past">Past</Option>
          <Option value="future">Future</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Shifts</FormLabel>
        <Select size="sm" placeholder="Filter by shift">
          <Option value="breakfast">Breakfast</Option>
          <Option value="lunch">Lunch</Option>
          <Option value="dinner">Dinner</Option>
        </Select>
      </FormControl>
      <FormControl size="sm">
        <FormLabel>Area</FormLabel>
        <Select size="sm" placeholder="Filter by area">
          <Option value="bar">BAR</Option>
          <Option value="lunch">MAIN ROOM</Option>
        </Select>
      </FormControl>
    </Fragment>
  );
  return (
    <Fragment>
      <Sheet
        sx={{
          display: { xs: 'flex', sm: 'none' },
          my: 1,
          gap: 1,
        }}
      >
        <Input
          size="sm"
          placeholder="Search"
          startDecorator={<SearchIcon />}
          sx={{ flexGrow: 1 }}
        />
      </Sheet>
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
          />
        </FormControl>
        {renderFilters()}
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
                <th style={{ width: 120, padding: '12px 6px' }}>
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
            {db.reservations
              .map((res) => ({
                ...res,
                customer: `${res.customer.firstName} ${res.customer.lastName}`,
              }))
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
