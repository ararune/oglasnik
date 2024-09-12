from django_cron import CronJobBase, Schedule
from django.utils import timezone
from django.core.management import call_command

class CheckOglasStatusJob(CronJobBase):
    RUN_EVERY_MINS = 1440 

    schedule = Schedule(run_every_mins=RUN_EVERY_MINS)
    code = 'oglasnik.management.commands.check_oglas_status'

    def do(self):
        call_command('check_oglas_status')
