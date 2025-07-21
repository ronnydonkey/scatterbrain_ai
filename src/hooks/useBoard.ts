import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ADVISOR_DIRECTORY } from '@/data/advisorsDirectory';
import { toast } from '@/hooks/use-toast';

export interface CustomAdvisor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  voice: string;
  category: string;
  isCustom: boolean;
  tier: string;
}

export interface BoardTemplate {
  id: string;
  name: string;
  description: string;
  advisor_ids: string[];
  category: string;
  usage_count: number;
}

export const useBoard = (userId?: string) => {
  const [selectedAdvisors, setSelectedAdvisors] = useState<any[]>([]);
  const [customAdvisors, setCustomAdvisors] = useState<CustomAdvisor[]>([]);
  const [boardTemplates, setBoardTemplates] = useState<BoardTemplate[]>([]);
  const [synthesisHistory, setSynthesisHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load user's board configuration
  useEffect(() => {
    const loadBoard = async () => {
      try {
        setLoading(true);

        if (!userId) {
          // Demo mode - load from localStorage
          const savedBoard = localStorage.getItem('scatterbrain_board');
          if (savedBoard) {
            try {
              const advisorIds = JSON.parse(savedBoard);
              const standardAdvisors = ADVISOR_DIRECTORY.filter(
                advisor => advisorIds.includes(advisor.id)
              );
              setSelectedAdvisors(standardAdvisors);
            } catch (e) {
              console.warn('Failed to parse localStorage board data');
            }
          }
          setLoading(false);
          return;
        }

        // Load board configuration
        const { data: boardData, error: boardError } = await supabase
          .from('user_boards')
          .select('advisor_ids')
          .eq('user_id', userId)
          .single();

        if (boardError && boardError.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.warn('Error loading board, using localStorage fallback:', boardError);
          // Fallback to localStorage
          const savedBoard = localStorage.getItem('scatterbrain_board');
          if (savedBoard) {
            try {
              const advisorIds = JSON.parse(savedBoard);
              const standardAdvisors = ADVISOR_DIRECTORY.filter(
                advisor => advisorIds.includes(advisor.id)
              );
              setSelectedAdvisors(standardAdvisors);
            } catch (e) {
              console.warn('Failed to parse localStorage board data');
            }
          }
          setLoading(false);
          return;
        }

        // Load custom advisors
        const { data: customData, error: customError } = await supabase
          .from('custom_advisors')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (customError) {
          console.warn('Error loading custom advisors:', customError);
        }

        // Load synthesis history
        const { data: historyData, error: historyError } = await supabase
          .from('synthesis_history')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (historyError) {
          console.warn('Error loading synthesis history:', historyError);
        }

        // Process loaded data
        const customAdvisorsWithMeta = (customData || []).map(advisor => ({
          ...advisor,
          isCustom: true,
          tier: 'insider'
        }));

        setCustomAdvisors(customAdvisorsWithMeta);
        setSynthesisHistory(historyData || []);

        if (boardData?.advisor_ids) {
          // Convert advisor IDs to advisor objects
          const standardAdvisors = ADVISOR_DIRECTORY.filter(
            advisor => boardData.advisor_ids.includes(advisor.id)
          );
          
          // Combine with custom advisors that are on the board
          const customOnBoard = customAdvisorsWithMeta.filter(
            advisor => boardData.advisor_ids.includes(advisor.id)
          );
          
          setSelectedAdvisors([...standardAdvisors, ...customOnBoard]);
        }
        
      } catch (error) {
        console.warn('Error loading board, using demo mode:', error);
        // Fallback to localStorage for demo
        const savedBoard = localStorage.getItem('scatterbrain_board');
        if (savedBoard) {
          try {
            const advisorIds = JSON.parse(savedBoard);
            const standardAdvisors = ADVISOR_DIRECTORY.filter(
              advisor => advisorIds.includes(advisor.id)
            );
            setSelectedAdvisors(standardAdvisors);
          } catch (e) {
            console.warn('Failed to parse localStorage board data');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadBoard();
  }, [userId]);

  // Load board templates
  useEffect(() => {
    const loadBoardTemplates = async () => {
      try {
        const { data, error } = await supabase
          .from('board_templates')
          .select('*')
          .eq('is_public', true)
          .order('usage_count', { ascending: false });

        if (error) {
          console.error('Error loading board templates:', error);
        } else {
          setBoardTemplates(data || []);
        }
      } catch (error) {
        console.error('Error loading board templates:', error);
      }
    };

    loadBoardTemplates();
  }, []);

  // Save board to Supabase (with fallback to localStorage for demo)
  const saveBoard = async (advisors: any[]) => {
    if (!userId) {
      // Save to localStorage for demo mode
      localStorage.setItem('scatterbrain_board', JSON.stringify(advisors.map(a => a.id)));
      return true;
    }

    try {
      setSaving(true);

      const advisorIds = advisors.map(a => a.id);

      const { error } = await supabase
        .from('user_boards')
        .upsert({
          user_id: userId,
          advisor_ids: advisorIds,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.warn('Database save failed, using localStorage fallback:', error);
        localStorage.setItem('scatterbrain_board', JSON.stringify(advisorIds));
        return true;
      }

      return true;
    } catch (error) {
      console.warn('Error saving board to database, using localStorage fallback:', error);
      localStorage.setItem('scatterbrain_board', JSON.stringify(advisors.map(a => a.id)));
      return true;
    } finally {
      setSaving(false);
    }
  };

  // Add custom advisor
  const addCustomAdvisor = async (advisor: Omit<CustomAdvisor, 'id' | 'isCustom' | 'tier'>) => {
    try {
      const newAdvisor = {
        ...advisor,
        id: `custom-${Date.now()}`,
        isCustom: true,
        tier: 'insider'
      };

      if (!userId) {
        // Demo mode - just add to local state
        setCustomAdvisors(prev => [newAdvisor, ...prev]);
        toast({
          title: "Custom advisor added",
          description: `${advisor.name} has been added to your advisor directory (demo mode).`,
        });
        return newAdvisor;
      }

      const { data, error } = await supabase
        .from('custom_advisors')
        .insert({
          user_id: userId,
          ...advisor
        })
        .select()
        .single();

      if (error) {
        console.warn('Database insert failed, using demo mode:', error);
        // Fallback to demo mode
        setCustomAdvisors(prev => [newAdvisor, ...prev]);
        toast({
          title: "Custom advisor added",
          description: `${advisor.name} has been added to your advisor directory (demo mode).`,
        });
        return newAdvisor;
      }

      const dbAdvisor = { ...data, isCustom: true, tier: 'insider' };
      setCustomAdvisors(prev => [dbAdvisor, ...prev]);
      
      toast({
        title: "Custom advisor added",
        description: `${advisor.name} has been added to your advisor directory.`,
      });

      return dbAdvisor;
    } catch (error) {
      console.warn('Error adding custom advisor, using demo mode:', error);
      // Fallback to demo mode
      const newAdvisor = {
        ...advisor,
        id: `custom-${Date.now()}`,
        isCustom: true,
        tier: 'insider'
      };
      setCustomAdvisors(prev => [newAdvisor, ...prev]);
      toast({
        title: "Custom advisor added",
        description: `${advisor.name} has been added to your advisor directory (demo mode).`,
      });
      return newAdvisor;
    }
  };

  // Remove custom advisor
  const removeCustomAdvisor = async (advisorId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('custom_advisors')
        .delete()
        .eq('id', advisorId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      setCustomAdvisors(prev => prev.filter(a => a.id !== advisorId));
      setSelectedAdvisors(prev => prev.filter(a => a.id !== advisorId));

      toast({
        title: "Custom advisor removed",
        description: "The advisor has been removed from your directory.",
      });

      return true;
    } catch (error) {
      console.error('Error removing custom advisor:', error);
      toast({
        title: "Error removing advisor",
        description: "Failed to remove custom advisor. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Save synthesis to history
  const saveSynthesis = async (inputText: string, advisorIds: string[], results: any) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from('synthesis_history')
        .insert({
          user_id: userId,
          input_text: inputText,
          advisor_ids: advisorIds,
          results: results
        });

      if (error) {
        throw error;
      }

      // Add to local state
      setSynthesisHistory(prev => [
        {
          id: Date.now().toString(),
          user_id: userId,
          input_text: inputText,
          advisor_ids: advisorIds,
          results: results,
          created_at: new Date().toISOString()
        },
        ...prev.slice(0, 19) // Keep only 20 most recent
      ]);

      return true;
    } catch (error) {
      console.error('Error saving synthesis:', error);
      return false;
    }
  };

  // Load a board template
  const loadBoardTemplate = async (template: BoardTemplate) => {
    try {
      // Update usage count
      await supabase
        .from('board_templates')
        .update({ usage_count: template.usage_count + 1 })
        .eq('id', template.id);

      // Load advisors from template
      const standardAdvisors = ADVISOR_DIRECTORY.filter(
        advisor => template.advisor_ids.includes(advisor.id)
      );

      setSelectedAdvisors(standardAdvisors);

      // Save the board if user is logged in
      if (userId) {
        await saveBoard(standardAdvisors);
      }

      toast({
        title: "Board template loaded",
        description: `Loaded "${template.name}" with ${standardAdvisors.length} advisors.`,
      });

      return true;
    } catch (error) {
      console.error('Error loading board template:', error);
      toast({
        title: "Error loading template",
        description: "Failed to load board template. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Auto-save board changes
  useEffect(() => {
    if (selectedAdvisors.length > 0 && userId && !loading) {
      const timeoutId = setTimeout(() => {
        saveBoard(selectedAdvisors);
      }, 1000); // Debounce saves by 1 second

      return () => clearTimeout(timeoutId);
    }
  }, [selectedAdvisors, userId, loading]);

  return {
    selectedAdvisors,
    setSelectedAdvisors,
    customAdvisors,
    boardTemplates,
    synthesisHistory,
    addCustomAdvisor,
    removeCustomAdvisor,
    saveBoard,
    saveSynthesis,
    loadBoardTemplate,
    loading,
    saving
  };
};