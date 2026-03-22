DELETE FROM site_content
WHERE section = 'hero'
  AND key IN ('feature_1_title','feature_1_desc','feature_2_title','feature_2_desc',
              'feature_3_title','feature_3_desc','feature_4_title','feature_4_desc');
