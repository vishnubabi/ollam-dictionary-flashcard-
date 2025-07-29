import csv
import os
from django.core.management.base import BaseCommand
from dictionary_app.models import DictionaryEntry

class Command(BaseCommand):
    help = 'Import Olam dictionary data from TSV file'

    def handle(self, *args, **kwargs):
        file_path = 'data/olam_data.tsv'  # ✅ Use this if you're running from malayalam_english directory

        print(f"🛠 Trying to open: {file_path}")

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f"❌ File not found: {file_path}"))
            return

        try:
            with open(file_path, 'r', encoding='utf-8') as tsvfile:
                reader = csv.DictReader(tsvfile, delimiter='\t', fieldnames=['from_content', 'types', 'to_content'])
                count = 0
                for row in reader:
                    DictionaryEntry.objects.create(**row)
                    count += 1
                    if count % 1000 == 0:
                        print(f"Imported {count} entries...")

            self.stdout.write(self.style.SUCCESS(f"✅ Successfully imported {count} dictionary entries."))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"❌ Error occurred: {e}"))
