-- Add first_name column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN first_name text;

-- Update the handle_new_user function to capture first_name from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  new_org_id uuid;
  retry_count integer := 0;
  max_retries integer := 3;
BEGIN
  -- Retry loop for organization creation
  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Create a personal organization for the new user
      INSERT INTO public.organizations (name, niche, subscription_tier, max_users, max_content_generations)
      VALUES (
        COALESCE(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'first_name', 'Personal') || '''s Organization',
        'lifestyle'::public.niche_type,
        'starter',
        1,
        50
      )
      RETURNING id INTO new_org_id;
      
      -- If we get here, organization creation succeeded
      EXIT;
      
    EXCEPTION
      WHEN others THEN
        retry_count := retry_count + 1;
        
        -- Log the error
        RAISE WARNING 'Failed to create organization for user % (attempt %/%): %', 
          new.id, retry_count, max_retries, SQLERRM;
        
        -- If this was the last retry, create a fallback
        IF retry_count >= max_retries THEN
          -- Create a fallback organization with a unique name
          INSERT INTO public.organizations (name, niche, subscription_tier, max_users, max_content_generations)
          VALUES (
            'User Organization ' || new.id,
            'lifestyle'::public.niche_type,
            'starter',
            1,
            50
          )
          RETURNING id INTO new_org_id;
        END IF;
    END;
  END LOOP;
  
  -- Retry loop for profile creation
  retry_count := 0;
  WHILE retry_count < max_retries LOOP
    BEGIN
      -- Insert the user profile with the organization
      INSERT INTO public.profiles (
        user_id, 
        display_name,
        first_name,
        organization_id,
        role
      )
      VALUES (
        new.id, 
        COALESCE(new.raw_user_meta_data ->> 'display_name', new.email),
        new.raw_user_meta_data ->> 'first_name',
        new_org_id,
        'owner'::public.user_role
      );
      
      -- If we get here, profile creation succeeded
      EXIT;
      
    EXCEPTION
      WHEN others THEN
        retry_count := retry_count + 1;
        
        -- Log the error
        RAISE WARNING 'Failed to create profile for user % (attempt %/%): %', 
          new.id, retry_count, max_retries, SQLERRM;
        
        -- If this was the last retry, still try to continue
        IF retry_count >= max_retries THEN
          -- Log critical error but don't fail the auth process
          RAISE WARNING 'CRITICAL: Could not create profile for user % after % attempts. User will need manual profile creation.', 
            new.id, max_retries;
          
          -- Insert minimal profile as last resort
          INSERT INTO public.profiles (user_id, display_name, organization_id, role)
          VALUES (new.id, new.email, new_org_id, 'owner'::public.user_role)
          ON CONFLICT (user_id) DO NOTHING;
        END IF;
    END;
  END LOOP;
  
  RETURN new;
  
EXCEPTION
  WHEN others THEN
    -- Log critical failure but don't prevent user creation
    RAISE WARNING 'CRITICAL FAILURE in handle_new_user for user %: %', new.id, SQLERRM;
    
    -- Return new so the auth process continues even if profile creation completely fails
    RETURN new;
END;
$function$;