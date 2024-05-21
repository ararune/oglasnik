""" kategorije.py """
import json
import os
from django.core.management.base import BaseCommand
from oglasnik.models import Kategorija

class Command(BaseCommand):
    help = 'Popunjava zapise kategorija iz kategorije.json'

    def handle(self, *args, **kwargs):
        datoteka_putanja = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'kategorije.json')
        with open(datoteka_putanja, 'r', encoding='utf-8') as file:
            data = json.load(file)
            self.kreiraj_kategorije(data)

    def kreiraj_kategorije(self, data, roditelj=None):
        for naziv, details in data.items():
            url = details.get('url')
            children = {k: v for k, v in details.items() if k != 'url'}
            kategorija = Kategorija.objects.create(naziv=naziv, url=url, roditelj=roditelj)
            self.stdout.write(self.style.SUCCESS(f'Dodana kategorija: {kategorija} s URL-om: {url}'))
            if children:
                self.kreiraj_kategorije(children, kategorija)
