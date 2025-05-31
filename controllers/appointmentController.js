import { appointmentModel } from "../models/appointmentSchema.js";

// Test endpoint for creating appointment without authentication
export const testCreateAppointment = async (req, res) => {
  console.log('==========================================');
  console.log('TEST CREATE APPOINTMENT CALLED');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Content-Type:', req.headers['content-type']);
  console.log('==========================================');
  
  try {
    // Check if the request body is empty or invalid
    if (!req.body || Object.keys(req.body).length === 0) {
      console.error('ERROR: Request body is empty or invalid');
      return res.status(400).json({
        success: false,
        message: "Invalid request body",
      });
    }
    
    // Extract all fields from the request body
    const { name, email, phone, message, title, description, fileName, fileUrl } = req.body;
    
    console.log('Extracted data:', { name, email, phone, message, title, description, fileName, fileUrl });

    // Validate required fields
    if (!name || !email || !phone || !message) {
      console.log('Validation failed - missing required fields');
      return res.status(400).json({
        success: false,
        message: "All fields are required",
        missingFields: [
          !name && 'name',
          !email && 'email',
          !phone && 'phone',
          !message && 'message'
        ].filter(Boolean)
      });
    }

    // Log the appointment data that will be saved
    const appointmentData = {
      name,
      email,
      phone,
      message,
      ...(title && { title }),
      ...(description && { description }),
      ...(fileName && { fileName }),
      ...(fileUrl && { fileUrl }),
    };
    
    console.log('Creating appointment with data:', JSON.stringify(appointmentData, null, 2));
    
    // Create the appointment model instance
    const appointment = new appointmentModel(appointmentData);

    console.log('Model instance created, validating...');
    
    // Manual validation check
    const validationError = appointment.validateSync();
    if (validationError) {
      console.error('Validation error:', validationError);
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: validationError.errors
      });
    }

    console.log('Validation passed. Saving appointment to database...');
    
    try {
      const savedAppointment = await appointment.save();
      console.log('APPOINTMENT SAVED SUCCESSFULLY!');
      console.log('Saved appointment data:', JSON.stringify(savedAppointment, null, 2));

      return res.status(201).json({
        success: true,
        message: "Test appointment request submitted successfully",
        data: savedAppointment,
      });
    } catch (saveError) {
      console.error('DATABASE SAVE ERROR:', saveError);
      console.error('Error stack:', saveError.stack);
      return res.status(500).json({
        success: false,
        message: "Database save error",
        error: saveError.message,
      });
    }
  } catch (error) {
    console.error('GENERAL ERROR IN APPOINTMENT CREATION:');
    console.error(error);
    console.error('Error stack:', error.stack);
    
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// Test endpoint to get all appointments (no authentication)
export const testGetAllAppointments = async (req, res) => {
  console.log('Get all appointments requested');
  try {
    const appointments = await appointmentModel.find().sort({ createdAt: -1 });
    console.log(`Found ${appointments.length} appointments`);
    
    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments,
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointments",
      error: error.message,
    });
  }
};

// Test endpoint to get a single appointment by ID (no authentication)
export const testGetAppointmentById = async (req, res) => {
  try {
    const appointment = await appointmentModel.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    
    res.status(200).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching appointment",
      error: error.message,
    });
  }
};

// Test endpoint to update an appointment (no authentication)
export const testUpdateAppointment = async (req, res) => {
  console.log('Update appointment requested for ID:', req.params.id);
  console.log('Update data:', JSON.stringify(req.body, null, 2));
  
  try {
    // Check if appointment exists
    const existingAppointment = await appointmentModel.findById(req.params.id);
    if (!existingAppointment) {
      console.log('Appointment not found with ID:', req.params.id);
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    
    // Update with new data
    const { name, email, phone, message, title, description, fileName, fileUrl } = req.body;
    
    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      req.params.id,
      { 
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(message && { message }),
        ...(title && { title }),
        ...(description && { description }),
        ...(fileName && { fileName }),
        ...(fileUrl && { fileUrl }),
      },
      { new: true, runValidators: true }
    );
    
    console.log('Appointment updated successfully:', JSON.stringify(updatedAppointment, null, 2));
    
    res.status(200).json({
      success: true,
      message: "Appointment updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment",
      error: error.message,
    });
  }
};

// Test endpoint to delete an appointment (no authentication)
export const testDeleteAppointment = async (req, res) => {
  console.log('Delete appointment requested for ID:', req.params.id);
  
  try {
    const appointment = await appointmentModel.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    
    await appointmentModel.findByIdAndDelete(req.params.id);
    console.log('Appointment deleted successfully');
    
    res.status(200).json({
      success: true,
      message: "Appointment deleted successfully",
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: "Error deleting appointment",
      error: error.message,
    });
  }
};

// Test endpoint to update appointment status (no authentication)
export const testUpdateAppointmentStatus = async (req, res) => {
  console.log('Update appointment status requested for ID:', req.params.id);
  console.log('New status:', req.body.status);
  
  try {
    // Validate status
    const { status } = req.body;
    if (!status || !['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be one of: pending, accepted, rejected",
      });
    }
    
    // Check if appointment exists
    const appointment = await appointmentModel.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }
    
    // Update status
    const updatedAppointment = await appointmentModel.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    console.log('Appointment status updated successfully:', updatedAppointment.status);
    
    res.status(200).json({
      success: true,
      message: "Appointment status updated successfully",
      data: updatedAppointment,
    });
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({
      success: false,
      message: "Error updating appointment status",
      error: error.message,
    });
  }
};
