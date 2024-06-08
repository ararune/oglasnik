# Generated by Django 5.0.6 on 2024-06-08 20:17

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('oglasnik', '0002_alter_slika_options_korisnik_telefon_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Favorit',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('datum', models.DateTimeField(auto_now_add=True)),
                ('korisnik', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favoriti', to=settings.AUTH_USER_MODEL)),
                ('oglas', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favoriti', to='oglasnik.oglas')),
            ],
            options={
                'verbose_name': 'Favorit',
                'verbose_name_plural': 'Favoriti',
                'unique_together': {('korisnik', 'oglas')},
            },
        ),
    ]
