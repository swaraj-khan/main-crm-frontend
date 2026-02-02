import { supabase } from "../pages/supabaseClient";

export interface DashboardPreferences {
  selectedCards: string[];
}

export const fetchDashboardPreferences = async (userId: string): Promise<DashboardPreferences> => {
  try {
    const { data, error } = await supabase
      .from('dashboard_preferences')
      .select('selected_cards')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No preferences found, return default
        return { selectedCards: [] };
      }
      console.error("Failed to fetch dashboard preferences", error);
      return { selectedCards: [] };
    }

    return { 
      selectedCards: data.selected_cards || [] 
    };
  } catch (error) {
    console.error("Failed to fetch dashboard preferences", error);
    return { selectedCards: [] };
  }
};

export const saveDashboardPreferences = async (userId: string, preferences: DashboardPreferences): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('dashboard_preferences')
      .upsert({
        user_id: userId,
        selected_cards: preferences.selectedCards,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });

    if (error) {
      console.error("Failed to save dashboard preferences", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Failed to save dashboard preferences", error);
    return false;
  }
};