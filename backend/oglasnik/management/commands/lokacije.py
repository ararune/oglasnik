from django.core.management.base import BaseCommand
from oglasnik.models import Zupanija, Grad
import json
import os

class Command(BaseCommand):
    help = 'Napuni gradove iz JSON datoteke'

    def handle(self, *args, **kwargs):
        
        script_dir = os.path.dirname(os.path.abspath(__file__))
        json_datoteka = os.path.join(script_dir, 'lokacije.json')

        with open(json_datoteka, 'r', encoding='utf-8') as file:
            data = json.load(file)

        for entry in data:
            zupanija_name = entry['zupanija'].replace(' Županija', '')
            zupanija, created = Zupanija.objects.get_or_create(naziv=zupanija_name)
            if created:
                self.stdout.write(self.style.SUCCESS(f'Kreirana zupanija: {zupanija}'))

            gradovi = entry['gradovi']
            for grad_entry in gradovi:
                grad_ime = grad_entry['grad']
                grad, created = Grad.objects.get_or_create(naziv=grad_ime, zupanija=zupanija)
                if created:
                    self.stdout.write(self.style.SUCCESS(f'Kreiran grad: {grad}'))

        self.stdout.write(self.style.SUCCESS('Izvršeno punjenje'))
