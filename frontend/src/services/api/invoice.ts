import api from "@/utils/axios";

export const getAllInvoicesAdmin = async () => {
  try {
    const response = await api.get('/invoice');
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

export const getAllInvoicesCustomer = async () => {
  try {
    const response = await api.get('/invoice/user');
    return response.data;
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
}

