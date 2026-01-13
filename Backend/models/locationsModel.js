import { supabase } from '../supabaseClient.js';

const Locations = {
  tableName: 'locations',

  async add({ busNumber, latitude, longitude, speed, timestamp }) {
    const { data, error } = await supabase
      .from(this.tableName)
      .insert([
        {
          busnumber: busNumber,
          latitude,
          longitude,
          speed: speed ?? 0,              // ✅ never null
          timestamp: timestamp || new Date() // ✅ always present
        }
      ])
      .select();

    if (error) {
      console.error('❌ Supabase insert error:', error);
      throw error;
    }

    console.log('✅ Inserted row:', data);
    return data;
  },

  async getLatest(busNumber) {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('busnumber', busNumber)
      .order('timestamp', { ascending: false })
      .limit(1);

    if (error) throw error;
    return data[0];
  }
};

export default Locations;






