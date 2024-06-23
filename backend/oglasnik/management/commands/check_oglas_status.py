from django.core.management.base import BaseCommand
from django.utils import timezone
from oglasnik.models import Oglas
from django.db.models import F

class Command(BaseCommand):
    help = 'Provjerava status oglasa kako bi se deaktivirali oglasi.'

    def handle(self, *args, **kwargs):
        today = timezone.now()
        oglasi_to_update = []

        all_oglasi = Oglas.objects.all()

        for oglas in all_oglasi:
            if oglas.status == 'aktivan' and oglas.datum:
                time_remaining = oglas.datum - (today - timezone.timedelta(days=1) * oglas.trajanje)

                if time_remaining <= timezone.timedelta():
                    self.stdout.write(f'Oglas "{oglas.naziv}" - Datum: {oglas.datum}, Time remaining: {time_remaining}')
                    oglas.status = 'neaktivan'
                    oglasi_to_update.append(oglas)

        for oglas in oglasi_to_update:
            oglas.save()

        self.stdout.write(self.style.SUCCESS(f'Successfully updated {len(oglasi_to_update)} Oglas instances.'))
