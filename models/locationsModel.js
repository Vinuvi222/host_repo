// locationsModel.js
import { supabase } from '../supabaseClient.js';

const Locations = {
  tableName: 'locations',

  async add({ busNumber, latitude, longitude, speed, timestamp }) {
    console.log('📝 Preparing to insert into Supabase table:', this.tableName);
    console.log('📝 Insert data:', {
      busnumber: busNumber,
      latitude,
      longitude,
      speed,
      timestamp: new Date(timestamp)
    });
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([
          {
            busnumber: busNumber,
            latitude,
            longitude,
            speed,
            timestamp: new Date(timestamp)
          }
        ])
        .select(); // returns inserted row

      if (error) {
        console.error('❌ Supabase insert error:', error);
        console.error('❌ Error details:', error.details);
        console.error('❌ Error hint:', error.hint);
        console.error('❌ Error code:', error.code);
        throw error;
      }
      
      console.log('✅ Supabase insert successful');
      console.log('✅ Inserted row:', data);
      return data;
    } catch (dbError) {
      console.error('❌ Database operation failed:', dbError);
      throw dbError;
    }
  },

  // Get latest location of a bus
  async getLatest(busNumber) {
    console.log(`🔍 Querying latest location for bus: ${busNumber}`);
    
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('busnumber', busNumber)
        .order('timestamp', { ascending: false }) // latest first
        .limit(1); // only one row

      if (error) {
        console.error('❌ Supabase query error:', error);
        throw error;
      }
      
      console.log(`✅ Query result for ${busNumber}:`, data);
      return data[0]; // returns the latest location
    } catch (queryError) {
      console.error('❌ Query failed:', queryError);
      throw queryError;
    }
  }
};

export default Locations;






