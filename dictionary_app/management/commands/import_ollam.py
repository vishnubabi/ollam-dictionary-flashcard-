import csv
import os
from django.core.management.base import BaseCommand
from dictionary_app.models import DictionaryEntry

class Command(BaseCommand):
    help = 'Import Olam dataset from TSV file'

    def handle(self, *args, **kwargs):
        print("⚡ import_ollam command started...")

        file_path = 'data/olam_data.tsv'

        # Check if file exists
        if not os.path.exists(file_path):
            print(f"❌ File not found at: {file_path}")
            return
        else:
            print(f"📂 File found: {file_path}")

        count = 0

        try:
            with open(file_path, newline='', encoding='utf-8') as tsvfile:
                reader = csv.DictReader(tsvfile, delimiter='\t', fieldnames=['from_content', 'types', 'to_content'])

                for row in reader:
                    from_word = row['from_content'].strip()
                    word_type = row['types'].strip().replace("{", "").replace("}", "")  # Remove curly braces
                    meaning = row['to_content'].strip()

                    DictionaryEntry.objects.create(
                        from_content=from_word,
                        types=word_type,
                        to_content=meaning
                    )
                    count += 1

                    # Optional: Show progress every 100 entries
                    if count % 100 == 0:
                        print(f"✅ Imported {count} entries...")

            print(f"🎉 Finished importing {count} entries!")

        except Exception as e:
            print(f"❌ Error during import: {e}")
